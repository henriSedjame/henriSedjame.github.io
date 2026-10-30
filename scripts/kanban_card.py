#!/usr/bin/env python3
"""Clôture d'une carte kanban sur commit et nettoyage du worktree/session au passage en Done.

Deux comportements, une seule source versionnée :

  close-on-commit  appelée par ``.githooks/post-commit``. Un commit sur la branche
                   d'une carte la fait passer en ``done``, avec le sha dans ``result``.
                   Un message de commit contenant ``[skip-kanban]`` laisse la carte ouverte.
  sweep            appelée par le cron Hermes ``kanban-done-cleanup``. Toute carte
                   passée en ``done`` après l'installation (peu importe qui l'a
                   déclenchée : hook, CLI, dashboard) voit son worktree supprimé
                   (s'il est propre) et sa session de discussion effacée.
                   La branche est toujours conservée.

Mise en service / vérification : ``install`` et ``status`` (cibles ``make
kanban-hooks-install`` / ``make kanban-hooks-status``).

Les cibles installées vivent **hors du dépôt**, dans le profil Hermes
(``<profil>/kanban-hooks/post-commit`` et ``<profil>/scripts/``) : un worktree
supprimé ne peut donc pas emporter le cron qui le supprime. La version de
référence reste celle du dépôt (``.githooks/post-commit``, ``scripts/kanban_card.py``) ;
``install`` la recopie et ``status`` signale toute dérive.

Le script ne commite pas, ne pousse pas et ne modifie aucun fichier du dépôt :
il lit git et la base kanban, clôt, supprime worktree/session et commente la carte.

Epoch : ``sweep`` ne touche que les cartes terminées APRÈS l'installation, pour ne
pas détruire les worktrees antérieurs à la mise en service.
"""

from __future__ import annotations

import glob
import hashlib
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import time
from pathlib import Path

BOARD = "portfolio"
PROFILE = "portfolio-dev"
CRON_JOB = "kanban-done-cleanup"
WRAPPER_NAME = "kanban_done_cleanup.py"
SCRIPT_NAME = "kanban_card.py"
HOOKS_DIRNAME = "kanban-hooks"
HOOK_NAME = "post-commit"

# Statuts depuis lesquels ``hermes kanban complete`` est accepté.
ACTIVE_STATUSES = ("running", "ready", "blocked", "review", "approved_after_review")

# Une session de discussion qui vient de parler n'est pas effacée tout de suite :
# on laisse passer ce délai et le tick suivant la reprend.
SESSION_QUIET_SECONDS = 120

# Fichier posé par worktree_create : jamais versionné, ne compte pas comme saleté.
WORKTREE_META = ".hermes-worktree.json"

# Marqueur d'échappatoire dans le message de commit (voir close-on-commit).
SKIP_MARKER = "[skip-kanban]"

STATE_DIRNAME = "kanban-cleanup"


# --------------------------------------------------------------------------- utils


def die(message: str, code: int = 1) -> int:
    print(f"kanban_card: {message}", file=sys.stderr)
    return code


def run(cmd: list[str], *, cwd: str | None = None, check: bool = True,
        timeout: int | None = 120) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True,
                          timeout=timeout, check=check)


def git(repo: str, *args: str, check: bool = True) -> subprocess.CompletedProcess:
    return run(["git", "-C", repo, *args], check=check)


def git_out(repo: str, *args: str, check: bool = True) -> str:
    return git(repo, *args, check=check).stdout.strip()


def resolve_repo(explicit: str | None) -> str | None:
    if explicit:
        return os.path.abspath(os.path.expanduser(explicit))
    cp = run(["git", "rev-parse", "--show-toplevel"], check=False)
    return cp.stdout.strip() or None


def common_git_dir(repo: str) -> Path:
    common = git_out(repo, "rev-parse", "--git-common-dir")
    base = Path(common)
    if not base.is_absolute():
        base = (Path(repo) / base).resolve()
    return base


def main_repo_root(repo: str) -> Path:
    """Racine du checkout principal, même quand le script est lancé depuis un worktree."""
    return common_git_dir(repo).parent


def hermes_home() -> Path:
    raw = os.environ.get("HERMES_HOME") or ""
    return Path(raw).expanduser() if raw else Path.home() / ".hermes"


def profile_dir() -> Path:
    """Dossier du profil Hermes, que ``HERMES_HOME`` soit la racine ou le profil."""
    home = hermes_home()
    if home.parent.name == "profiles" and home.name == PROFILE:
        return home
    candidate = home / "profiles" / PROFILE
    if candidate.is_dir() or home.name != "profiles":
        return candidate
    return home


def hooks_dir() -> Path:
    """Dossier de hooks installé, hors dépôt (survit à la suppression d'un worktree)."""
    return profile_dir() / HOOKS_DIRNAME


def scripts_dir() -> Path:
    return profile_dir() / "scripts"


def wrapper_path() -> Path:
    return scripts_dir() / WRAPPER_NAME


def script_copy_path() -> Path:
    return scripts_dir() / SCRIPT_NAME


def hook_copy_path() -> Path:
    return hooks_dir() / HOOK_NAME


def worktrees_root(repo: str) -> Path:
    return (main_repo_root(repo) / ".worktrees").resolve()


def state_path(repo: str) -> Path:
    return common_git_dir(repo) / STATE_DIRNAME / "state.json"


def load_state(repo: str) -> dict:
    path = state_path(repo)
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {"tasks": {}}
    if not isinstance(state, dict):
        return {"tasks": {}}
    state.setdefault("tasks", {})
    return state


def save_state(repo: str, state: dict) -> None:
    path = state_path(repo)
    path.parent.mkdir(parents=True, exist_ok=True)
    state.setdefault("tasks", {})
    path.write_text(json.dumps(state, indent=1, sort_keys=True) + "\n", encoding="utf-8")


def sha256(path: Path) -> str | None:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError:
        return None


def hermes_bin() -> str | None:
    """``hermes`` tel qu'il sera lancé : le hook git n'a pas toujours le PATH du shell."""
    candidates = [
        os.environ.get("HERMES_BIN"),
        shutil.which("hermes"),
        str(Path.home() / ".local/bin/hermes"),
        str(Path.home() / ".hermes/hermes-agent/.hermes/bin/hermes"),
    ]
    for candidate in candidates:
        if candidate and Path(candidate).is_file() and os.access(candidate, os.X_OK):
            return candidate
    return None


def cli_args(*args: str) -> list[str]:
    binp = hermes_bin()
    if not binp:
        raise RuntimeError("binaire `hermes` introuvable (HERMES_BIN ?)")
    return [binp, *args]


def cli_env() -> dict:
    env = dict(os.environ)
    # L'environnement de session peut épingler un autre board : --board l'emporte.
    env.pop("HERMES_KANBAN_BOARD", None)
    # Dans un contexte worker/délégation, le noyau refuse toute mutation kanban :
    # le balayage et la clôture doivent pouvoir agir depuis ce contexte.
    env.pop("HERMES_DELEGATED_CHILD_CONTEXT", None)
    return env


def kanban(*args: str, check: bool = True, timeout: int = 120) -> subprocess.CompletedProcess:
    return subprocess.run(
        cli_args("kanban", "--board", BOARD, *args),
        capture_output=True, text=True, timeout=timeout, check=check, env=cli_env(),
    )


def list_tasks(*args: str) -> list[dict]:
    cp = kanban("list", "--json", *args)
    try:
        data = json.loads(cp.stdout or "[]")
    except ValueError:
        return []
    return data if isinstance(data, list) else []


def comment(task_id: str, text: str) -> None:
    kanban("comment", task_id, text, check=False, timeout=60)


# ------------------------------------------------------------------- close-on-commit


def cmd_close_on_commit(repo_arg: str | None) -> int:
    repo = resolve_repo(repo_arg)
    if not repo:
        return die("dépôt git introuvable", 2)

    branch = git(repo, "symbolic-ref", "--quiet", "--short", "HEAD", check=False).stdout.strip()
    if not branch or not branch.startswith("feature/"):
        return 0  # main, branche de build, HEAD détaché : aucune carte à clore

    sha = git_out(repo, "rev-parse", "--short", "HEAD", check=False)
    subject = git_out(repo, "log", "-1", "--format=%s", check=False)
    if not sha:
        return 0
    # Échappatoire : un commit de travail sur la branche d'une carte ne doit pas la
    # clore par accident. `git commit -m "wip ... [skip-kanban]"` laisse la carte ouverte.
    if SKIP_MARKER in subject.lower():
        print(f"kanban: commit {sha} marqué {SKIP_MARKER} — aucune carte close", file=sys.stderr)
        return 0

    tasks = list_tasks()
    candidates = [
        task for task in tasks
        if (task.get("branch_name") or "") == branch
        and (task.get("status") or "") in ACTIVE_STATUSES
    ]
    if not candidates:
        return 0
    if len(candidates) > 1:
        ids = ", ".join(task["id"] for task in candidates)
        return die(f"plusieurs cartes actives sur {branch} ({ids}) : clôture humaine requise", 1)

    task = candidates[0]
    result = f"commit {sha} {subject} — clôture automatique (post-commit)"
    try:
        cp = kanban("complete", task["id"], "--result", result, check=False)
    except Exception as exc:  # binaire absent, timeout : ne jamais casser le commit
        return die(f"clôture de {task['id']} impossible : {exc}", 0)

    if cp.returncode == 0:
        print(f"kanban: {task['id']} → done (commit {sha} sur {branch})", file=sys.stderr)
        return 0

    error = (cp.stderr or cp.stdout or "").strip().splitlines()
    detail = error[-1] if error else f"code {cp.returncode}"
    comment(
        task["id"],
        f"commit `{sha}` (`{subject}`) sur `{branch}` : clôture automatique impossible — {detail}. "
        "Aucune clôture forcée (un worker vivant n'est pas tué par un commit).",
    )
    print(f"kanban: {task['id']} non close (commit {sha}) — {detail}", file=sys.stderr)
    return 0


# ------------------------------------------------------------------------- sweep


def worktree_registered(repo: str, path: Path) -> bool:
    cp = git(repo, "worktree", "list", "--porcelain", check=False)
    for line in cp.stdout.splitlines():
        if line.startswith("worktree "):
            candidate = Path(line[len("worktree "):].strip()).resolve()
            if candidate == path:
                return True
    return False


def worktree_dirty(path: Path) -> list[str]:
    cp = git(str(path), "status", "--porcelain", "--untracked-files=normal", check=False)
    if cp.returncode != 0:
        return [f"git status a échoué : {(cp.stderr or '').strip()}"]
    return [line for line in cp.stdout.splitlines()
            if not line.endswith(WORKTREE_META)]


def branch_pushed(repo: str, branch: str) -> bool | None:
    """True/False si le remote répond, None si on ne peut pas savoir."""
    if not branch:
        return None
    try:
        cp = run(["git", "-C", repo, "ls-remote", "--heads", "origin", branch],
                 check=False, timeout=20,
                 cwd=repo)
    except Exception:
        return None
    if cp.returncode != 0:
        return None
    return branch in cp.stdout


def profiles_root() -> Path:
    """Racine qui contient ``profiles/`` — ``HERMES_HOME`` peut être la racine ou le profil."""
    home = hermes_home()
    return home.parent if home.parent.name == "profiles" else home


def profile_state_dbs() -> list[tuple[str, Path]]:
    dbs: list[tuple[str, Path]] = []
    root = profiles_root()
    default_db = root / "state.db"
    if default_db.is_file():
        dbs.append(("default", default_db))
    for path in sorted(glob.glob(str(root / "profiles" / "*" / "state.db"))):
        dbs.append((Path(path).parent.name, Path(path)))
    return dbs


def discussion_sessions(task_id: str) -> list[dict]:
    """Sessions titrées ``t_<id> · …`` (convention du dashboard/TUI pour une carte)."""
    pattern = re.compile(rf"^{re.escape(task_id)}(?:\b|·|\s)")
    found: list[dict] = []
    for profile, db in profile_state_dbs():
        try:
            conn = sqlite3.connect(f"file:{db}?mode=ro", uri=True, timeout=5)
        except sqlite3.Error:
            continue
        try:
            rows = conn.execute(
                "SELECT id, title, archived, last_activity_at FROM sessions "
                "WHERE title LIKE ?",
                (f"{task_id}%",),
            ).fetchall()
        except sqlite3.Error:
            rows = []
        finally:
            conn.close()
        for sid, title, archived, last_activity in rows:
            if not title or not pattern.match(title):
                continue
            if archived:
                continue
            found.append({
                "id": sid,
                "profile": profile,
                "title": title,
                "last_activity_at": last_activity,
            })
    return found


def delete_sessions(task_id: str, *, self_ids: set[str]) -> tuple[list[str], list[str], list[str]]:
    """Supprime les sessions de discussion.

    Renvoie ``(supprimées, encore actives (reportées), échecs)`` : une session qui
    vient de parler est reprise au tick suivant, un refus du CLI est signalé mais
    ne bloque ni le nettoyage du worktree ni la clôture du dossier.
    """
    removed: list[str] = []
    recent: list[str] = []
    failed: list[str] = []
    now = time.time()
    for session in discussion_sessions(task_id):
        sid = session["id"]
        if sid in self_ids:
            continue
        last = session["last_activity_at"] or 0
        if last and (now - float(last)) < SESSION_QUIET_SECONDS:
            recent.append(sid)
            continue
        args = [] if session["profile"] == "default" else ["-p", session["profile"]]
        cp = subprocess.run(
            cli_args(*args, "sessions", "delete", sid, "--yes"),
            capture_output=True, text=True, timeout=120, check=False, env=cli_env(),
        )
        if cp.returncode == 0:
            removed.append(sid)
        else:
            failed.append(sid)
    return removed, recent, failed


def cmd_sweep(repo_arg: str | None) -> int:
    repo = resolve_repo(repo_arg)
    if not repo:
        return die("dépôt git introuvable", 2)

    root = str(main_repo_root(repo))
    state = load_state(repo)
    epoch = state.get("epoch")
    if not epoch:
        return die("epoch absente — lancer `make kanban-hooks-install` avant de compter sur le nettoyage", 2)

    wt_root = worktrees_root(repo)
    self_ids = {v for v in (os.environ.get("HERMES_SESSION_CHAT_ID"),
                            os.environ.get("HERMES_SESSION_ID")) if v}

    touched = 0
    for task in list_tasks("--status", "done"):
        task_id = task["id"]
        record = state["tasks"].get(task_id, {})
        if record.get("result") == "cleaned":
            continue
        if (task.get("completed_at") or 0) < int(epoch):
            continue  # terminée avant la mise en service : on ne touche pas
        if (task.get("workspace_kind") or "") != "worktree":
            continue

        raw_path = task.get("workspace_path") or ""
        if not raw_path:
            continue
        path = Path(raw_path).resolve()
        if wt_root not in path.parents:
            print(f"kanban-cleanup: {task_id} — chemin hors `.worktrees/`, ignoré ({path})")
            state["tasks"][task_id] = {"result": "skipped", "at": int(time.time())}
            save_state(repo, state)
            continue

        branch = task.get("branch_name") or ""
        notes: list[str] = []
        removed_worktree = False

        if path.exists() and worktree_registered(root, path):
            dirty = worktree_dirty(path)
            if dirty:
                signature = "dirty:" + "|".join(sorted(dirty))[:400]
                if record.get("commented") != signature:
                    comment(
                        task_id,
                        "nettoyage impossible : le worktree `" + str(path) + "` porte des "
                        f"modifications non commitées ({len(dirty)} entrée(s)) — aucune suppression "
                        "forcée, le worktree est laissé en l'état.",
                    )
                state["tasks"][task_id] = {
                    "result": "dirty", "at": int(time.time()),
                    "commented": signature, "path": str(path),
                }
                save_state(repo, state)
                print(f"kanban-cleanup: {task_id} — worktree sale, non supprimé : {path}")
                touched += 1
                continue

            # Le marqueur de worktree est excusé par le contrôle de propreté ci-dessus,
            # mais `git worktree remove` refuse un fichier non suivi : on le retire ici,
            # jamais avant le contrôle (une modification suivie reste bloquante).
            marker = path / WORKTREE_META
            try:
                marker.unlink()
            except FileNotFoundError:
                pass
            except OSError as exc:
                print(f"kanban-cleanup: {task_id} — marqueur non supprimable ({exc})")

            cp = git(root, "worktree", "remove", str(path), check=False)
            if cp.returncode != 0:
                detail = (cp.stderr or cp.stdout or "").strip().splitlines()
                detail_s = detail[-1] if detail else f"code {cp.returncode}"
                if record.get("commented") != f"remove:{detail_s}":
                    comment(task_id, f"nettoyage impossible : `git worktree remove` a échoué — {detail_s}")
                state["tasks"][task_id] = {
                    "result": "error", "at": int(time.time()),
                    "commented": f"remove:{detail_s}", "path": str(path),
                }
                save_state(repo, state)
                print(f"kanban-cleanup: {task_id} — suppression impossible : {detail_s}")
                touched += 1
                continue
            removed_worktree = True
            notes.append("worktree supprimé")
        elif path.exists():
            # répertoire présent mais worktree inconnu de git : on ne supprime rien à l'aveugle
            print(f"kanban-cleanup: {task_id} — répertoire hors registre git, ignoré : {path}")
            state["tasks"][task_id] = {"result": "skipped", "at": int(time.time()), "path": str(path)}
            save_state(repo, state)
            continue
        else:
            notes.append("worktree déjà absent")

        git(root, "worktree", "prune", check=False)

        removed_sessions, recent_sessions, failed_sessions = delete_sessions(task_id, self_ids=self_ids)
        if removed_sessions:
            notes.append("session(s) supprimée(s) : " + ", ".join(f"`{sid}`" for sid in removed_sessions))
        if recent_sessions:
            notes.append("session(s) encore active(s), reportée(s) au tick suivant")
        if failed_sessions:
            notes.append("session(s) non supprimable(s) : "
                         + ", ".join(f"`{sid}`" for sid in failed_sessions))

        pushed = branch_pushed(root, branch)
        if pushed is True:
            notes.append(f"branche `{branch}` conservée (présente sur origin)")
        elif pushed is False:
            notes.append(f"branche `{branch}` conservée mais ABSENTE de origin — à pousser à la main")
        else:
            notes.append(f"branche `{branch}` conservée (état distant non vérifié)")

        pending = bool(recent_sessions)
        if not pending:
            comment(task_id, "nettoyage automatique au passage en done — " + " · ".join(notes))
            state["tasks"][task_id] = {
                "result": "cleaned", "at": int(time.time()),
                "removed_worktree": removed_worktree,
                "sessions_removed": removed_sessions, "branch": branch,
                "sessions_failed": failed_sessions,
            }
        else:
            state["tasks"][task_id] = {
                "result": "sessions-pending", "at": int(time.time()),
                "sessions_removed": list(
                    set(state["tasks"].get(task_id, {}).get("sessions_removed", [])) | set(removed_sessions)
                ),
                "path": str(path), "branch": branch,
            }
        save_state(repo, state)
        touched += 1
        print(f"kanban-cleanup: {task_id} — " + " · ".join(notes))

    if touched:
        print(f"kanban-cleanup: {touched} carte(s) traitée(s) — {time.strftime('%Y-%m-%d %H:%M:%S')}")
    return 0


# ------------------------------------------------------------ install / status


def cron_jobs() -> str:
    cp = subprocess.run(cli_args("-p", PROFILE, "cron", "list", "--all"),
                        capture_output=True, text=True, check=False, env=cli_env(), timeout=120)
    return (cp.stdout or "") + (cp.stderr or "")


def cron_job_active() -> bool:
    """Le job existe et n'est pas en pause.

    ``hermes cron list`` affiche l'état sur la ligne de l'id, le nom juste en dessous :
    on apparie donc chaque ligne d'état avec les quelques lignes qui la suivent.
    """
    lines = cron_jobs().splitlines()
    for index, line in enumerate(lines):
        state = re.search(r"\[(active|paused|disabled|completed)\]", line)
        if not state:
            continue
        block = "\n".join(lines[index:index + 6])
        if CRON_JOB in block:
            return state.group(1) == "active"
    return False


def write_wrapper(main_root: Path) -> Path:
    """Le wrapper du cron ne pointe jamais vers un worktree : cibles stables uniquement."""
    path = wrapper_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    targets = [str(Path(main_root) / "scripts" / SCRIPT_NAME), str(script_copy_path())]
    path.write_text(
        "#!/usr/bin/env python3\n"
        '"""Généré par `make kanban-hooks-install` — ne pas éditer à la main.\n'
        "\n"
        "Balayage `kanban_card.py sweep` sur la racine principale du dépôt. Les cibles\n"
        "sont stables et hors worktree : supprimer un worktree ne casse pas ce cron.\n"
        '"""\n'
        "import os\n"
        "import runpy\n"
        "import sys\n"
        "\n"
        f"REPO = {str(main_root)!r}\n"
        f"TARGETS = {targets!r}\n"
        "\n"
        "for target in TARGETS:\n"
        "    if os.path.isfile(target):\n"
        "        sys.argv = ['kanban_card.py', 'sweep', '--repo', REPO]\n"
        "        runpy.run_path(target, run_name='__main__')\n"
        "        sys.exit(0)\n"
        "\n"
        "sys.stderr.write('kanban-done-cleanup: aucun script utilisable dans %r\\n' % (TARGETS,))\n"
        "sys.exit(1)\n",
        encoding="utf-8",
    )
    path.chmod(0o755)
    return path


def wrapper_repo(path: Path) -> str | None:
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return None
    match = re.search(r"^REPO = (.+)$", text, re.MULTILINE)
    if not match:
        return None
    try:
        value = json.loads(match.group(1).replace("'", '"'))
    except ValueError:
        return None
    return str(value)


def source_root(repo: str) -> tuple[Path, bool]:
    """Racine qui porte la version à installer : checkout principal de préférence."""
    candidates = ((main_repo_root(repo), True), (Path(repo).resolve(), False))
    for root, canonical in candidates:
        if ((root / ".githooks" / HOOK_NAME).is_file()
                and (root / "scripts" / SCRIPT_NAME).is_file()):
            return root, canonical
    return Path(repo).resolve(), False


def cmd_install(repo_arg: str | None) -> int:
    repo = resolve_repo(repo_arg)
    if not repo:
        return die("dépôt git introuvable", 2)

    main_root = main_repo_root(repo)
    src, canonical = source_root(repo)
    hook_src = src / ".githooks" / HOOK_NAME
    script_src = src / "scripts" / SCRIPT_NAME
    if not hook_src.is_file() or not script_src.is_file():
        return die(
            f"version introuvable : ni {main_root} ni {repo} ne portent "
            f".githooks/{HOOK_NAME} + scripts/{SCRIPT_NAME} — merger la branche sur main, "
            "puis relancer depuis le checkout principal", 2,
        )

    hooks_dir().mkdir(parents=True, exist_ok=True)
    scripts_dir().mkdir(parents=True, exist_ok=True)

    dst = hook_copy_path()
    shutil.copyfile(hook_src, dst)
    dst.chmod(0o755)
    print(f"hook installé : {dst} (source : {hook_src})")
    if not canonical:
        print("ATTENTION : la racine principale n'a pas encore le hook — installation depuis "
              f"{src} (avant merge). Relancer `make kanban-hooks-install` depuis main après merge.")

    copy = script_copy_path()
    shutil.copyfile(script_src, copy)
    copy.chmod(0o755)
    print(f"script        : {copy} (source : {script_src})")

    current = git_out(repo, "config", "--get", "core.hooksPath", check=False)
    if current != str(hooks_dir()):
        git(repo, "config", "core.hooksPath", str(hooks_dir()))
        print(f"core.hooksPath = {hooks_dir()} (absolu, partagé par tous les worktrees)")

    wrapper = write_wrapper(main_root)
    print(f"wrapper cron  : {wrapper} (dépôt : {main_root})")

    if not cron_job_active():
        cp = subprocess.run(
            cli_args("-p", PROFILE, "cron", "create", "1m", "--name", CRON_JOB,
                     "--no-agent", "--script", WRAPPER_NAME, "--deliver", "local"),
            capture_output=True, text=True, check=False, env=cli_env(), timeout=120,
        )
        print((cp.stdout or "").strip() or (cp.stderr or "").strip())
        if cp.returncode != 0:
            return die("création du cron impossible", 2)
    else:
        print(f"cron          : {CRON_JOB} déjà actif")

    state = load_state(repo)
    if not state.get("epoch"):
        state["epoch"] = int(time.time())
        save_state(repo, state)
        print(f"epoch         : {state['epoch']} (aucune carte terminée avant ne sera nettoyée)")

    print()
    return cmd_status(repo)


def worktree_list(repo: str) -> list[Path]:
    cp = git(repo, "worktree", "list", "--porcelain", check=False)
    paths = []
    for line in cp.stdout.splitlines():
        if line.startswith("worktree "):
            paths.append(Path(line[len("worktree "):].strip()))
    return paths


def hooks_dir_for(worktree: Path) -> Path | None:
    """Dossier de hooks effectivement utilisé par un worktree (résolution manuelle
    d'un `core.hooksPath` relatif, que `git rev-parse` ne résout pas)."""
    raw = git_out(str(worktree), "config", "--get", "core.hooksPath", check=False)
    if not raw:
        return None
    path = Path(raw).expanduser()
    return path if path.is_absolute() else (worktree / path).resolve()


def cmd_status(repo_arg: str | None) -> int:
    repo = resolve_repo(repo_arg)
    if not repo:
        return die("dépôt git introuvable", 2)

    main_root = main_repo_root(repo)
    checks: list[tuple[str, bool, str]] = []

    raw_hooks = git_out(repo, "config", "--get", "core.hooksPath", check=False)
    raw_path = Path(raw_hooks).expanduser() if raw_hooks else None
    hooks_ok = bool(raw_path) and raw_path.is_absolute() and raw_path.resolve() == hooks_dir().resolve()
    checks.append((
        "core.hooksPath", hooks_ok,
        f"{raw_hooks or '(non défini)'}"
        + ("" if hooks_ok else f" — attendu {hooks_dir()} (absolu)"),
    ))

    hook = hook_copy_path()
    executable = hook.is_file() and os.access(hook, os.X_OK)
    checks.append((f"hook {HOOK_NAME}", executable, str(hook) if executable else f"absent/non exécutable : {hook}"))

    src, canonical = source_root(repo)
    hook_src = src / ".githooks" / HOOK_NAME
    if hook_src.is_file():
        hook_fresh = sha256(hook_src) == sha256(hook)
        hook_detail = (f"identique à {hook_src}" if hook_fresh
                       else f"périmé — relancer `make kanban-hooks-install` (source {hook_src})")
    else:
        hook_fresh = hook.is_file()
        hook_detail = f"source versionnée absente de {src} — comparaison impossible, hook installé conservé"
    checks.append(("hook à jour", hook_fresh, hook_detail))

    main_script = main_root / "scripts" / SCRIPT_NAME
    copy = script_copy_path()
    if main_script.is_file():
        source_ok, source_detail = True, f"{main_script} (racine principale, prioritaire)"
    elif copy.is_file():
        source_ok, source_detail = True, f"{copy} (copie locale — merge dans main en attente)"
    else:
        source_ok, source_detail = False, f"ni {main_script} ni {copy}"
    checks.append(("script de clôture", source_ok, source_detail))

    ref = main_script if main_script.is_file() else (src / "scripts" / SCRIPT_NAME)
    if ref.is_file() and copy.is_file():
        copy_ok = sha256(ref) == sha256(copy)
        copy_detail = (f"identique à {ref}" if copy_ok
                       else "périmée — relancer `make kanban-hooks-install`")
    else:
        copy_ok = copy.is_file()
        copy_detail = f"source versionnée absente de {src} — comparaison impossible, copie conservée"
    checks.append(("copie à jour", copy_ok, copy_detail))

    wrapper = wrapper_path()
    w_repo = wrapper_repo(wrapper) if wrapper.is_file() else None
    w_path = Path(w_repo).resolve() if w_repo else None
    wrapper_ok = bool(
        w_path and w_path == main_root.resolve() and worktrees_root(repo) not in w_path.parents
    )
    checks.append((
        f"wrapper {WRAPPER_NAME}", wrapper_ok,
        f"{wrapper} → {w_repo or 'REPO illisible'}"
        + ("" if wrapper_ok else " — doit viser la racine principale, jamais un worktree"),
    ))

    for wt in worktree_list(repo):
        resolved = hooks_dir_for(wt)
        ok = bool(resolved) and resolved == hooks_dir().resolve() and executable
        checks.append((
            f"worktree {wt.name}", ok,
            f"hooks : {resolved or '(non défini)'}" + ("" if ok else " — hook absent pour ce worktree"),
        ))

    active = cron_job_active()
    checks.append((f"cron {CRON_JOB}", active, "actif (1 min)" if active else "absent ou en pause"))

    state = load_state(repo)
    checks.append(("epoch de nettoyage", bool(state.get("epoch")), str(state.get("epoch") or "absente")))

    binp = hermes_bin()
    checks.append(("binaire hermes", bool(binp), binp or "introuvable"))

    width = max(len(name) for name, _, _ in checks)
    failed = 0
    for name, ok, detail in checks:
        if not ok:
            failed += 1
        print(f"{'OK  ' if ok else 'FAIL'} {name.ljust(width)} — {detail}")

    if failed:
        print(f"\n{failed} vérification(s) en échec : la clôture sur commit et/ou le nettoyage "
              "ne sont PAS opérationnels. Lancer `make kanban-hooks-install`.", file=sys.stderr)
        return 1
    print("\nClôture sur commit et nettoyage au passage en done : opérationnels.")
    return 0


# -------------------------------------------------------------------------- main


def main(argv: list[str]) -> int:
    import argparse

    parser = argparse.ArgumentParser(description=(__doc__ or "").splitlines()[0])
    parser.add_argument("--repo", help="racine du dépôt (défaut : dépôt courant)")
    sub = parser.add_subparsers(dest="command", required=True)
    for name, help_text in (
        ("close-on-commit", "clore la carte dont la branche vient de recevoir un commit"),
        ("sweep", "nettoyer worktree et session des cartes passées en done"),
        ("install", "installer hook + cron et vérifier"),
        ("status", "vérifier que la mécanique est en place"),
    ):
        p = sub.add_parser(name, help=help_text)
        p.add_argument("--repo", dest="repo_sub", help=argparse.SUPPRESS)
        p.set_defaults(func=name)

    args = parser.parse_args(argv)
    repo = args.repo_sub or args.repo
    handlers = {
        "close-on-commit": cmd_close_on_commit,
        "sweep": cmd_sweep,
        "install": cmd_install,
        "status": cmd_status,
    }
    return handlers[args.func](repo)


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except SystemExit:
        raise
    except Exception as exc:  # un tick de cron ne doit pas déverser une trace
        print(f"kanban_card: échec {type(exc).__name__}: {exc}", file=sys.stderr)
        sys.exit(1)
