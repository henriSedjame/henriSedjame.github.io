# 📄 Henri SEDJAME portfolio

Ce repository contient le code source de mon portfolio personnel www.henrisedjame.dev.

J'y présente qui je suis ✋. 

J'y détaille aussi mes compétences 💻, mes expériences professionnelles 🏢 ainsi mes projets personnels 📂.

---

## ⚒️  Stack technique

 Ce portfolio a été développé avec les technologies suivantes :
    
  - **Angular 21** comme framework **TypeScript** — `@angular/core` / `@angular/cli` **21.1.1**, TypeScript **5.9.3**
  - **Bun 1.3.14** comme unique gestionnaire de paquets (bun reste le seul outil déclaré dans `packageManager`, `cli.packageManager` et la CI)
  - **Vitest** (builder `@angular/build:unit-test`, environnement **jsdom 27.4.0**) pour les tests unitaires
    
  ### Librairies
  - **Tailwind CSS 4.1.18** pour le design, complété par un design system SCSS maison
  - **@ngrx/signals 21.0.1** pour la gestion d'état
  - **@ngx-translate/core 17.0.0** pour la gestion de l'internationalisation

Les versions ci-dessus sont celles réellement installées (relevé du 2026-10-30) ; la source de
vérité reste `source_code/package.json` et `source_code/bun.lock`, seul lockfile versionné.

## 🗂️  Organisation du dépôt

  - `source_code/` : **l'application Angular**, tout le code source est ici.
  - La **racine du dépôt** (`index.html`, `main-<hash>.js`, `styles-<hash>.css`, `i18n/`,
    `tech-icons/`, images) est la **sortie de build**, republiée automatiquement par la CI
    (`.github/workflows/build.yml`) à chaque push sur `main`. **Ne pas éditer ces fichiers à la
    main** : le build suivant les écrase.

## 🚀  Démarrage

Toutes les commandes se lancent depuis `source_code/` :

```bash
cd source_code
bun install                     # dépendances (bun.lock = source de vérité)
bun run start                   # serveur de dev → http://localhost:4200
bun run build                   # build production → dist/henrisedjame.dev/
bun run lint                    # ESLint (angular-eslint)
bun run test -- --watch=false   # tests unitaires (Vitest + jsdom)
```

État des contrôles au 2026-10-30 : `bun run build` passe ; `bun run lint` remonte des erreurs
préexistantes (`prefer-const`, `no-inferrable-types`) et 6 specs sur 16 échouent. Dette connue,
sans effet sur le build ni sur le déploiement.

---
## 🔁 Outillage kanban (clôture sur commit, nettoyage sur done)

Deux automatismes relient ce dépôt au board kanban `portfolio`, pour supprimer deux gestes
manuels : clore la carte à la main après un commit, puis nettoyer à la main le worktree et la
session de discussion.

**a. Un commit sur la branche d'une carte clôt la carte.**
`.githooks/post-commit` (versionné) appelle `scripts/kanban_card.py close-on-commit` : la branche
courante est comparée à `tasks.branch_name` du board, et la carte concernée passe en `done` avec
le sha dans `result`. Un commit sur `main` (ou toute branche hors `feature/*`) ne clôt rien ;
un message contenant `[skip-kanban]` laisse la carte ouverte (commit de travail). Le hook ne
commite pas, ne pousse pas, n'écrit aucun fichier et ne bloque jamais un commit.

Le hook **installé** est une copie dans `<profil Hermes>/kanban-hooks/post-commit`, et
`core.hooksPath` pointe sur ce dossier en **absolu** : la configuration est partagée par tous les
worktrees, et un worktree dont le checkout ne contient pas `.githooks/` (créé avant le merge)
déclenche quand même la clôture. Le hook résout le script depuis la **racine principale**
(`<main>/scripts/kanban_card.py`), avec repli sur la copie installée dans le profil : supprimer un
worktree ne peut donc pas rendre la clôture muette.

**b. Au passage en `done` — quel qu'en soit l'auteur (hook, CLI, glisser-déposer dashboard) — le
worktree et la session de discussion sont nettoyés.** `scripts/kanban_card.py sweep`, planifié par
un job cron Hermes (`kanban-done-cleanup`, toutes les minutes, `--no-agent`), **lit l'état de la
base** (`list --status done`) : il est donc indifférent au déclencheur. Il supprime :

- le worktree `<repo>/.worktrees/feature-<slug>` s'il est **propre** (`git worktree remove`, sans
  `--force`, puis `git worktree prune`) ; un worktree sale n'est **pas** supprimé et la carte
  reçoit un commentaire d'erreur. Le marqueur `.hermes-worktree.json` posé par `worktree_create`
  est excusé par le contrôle de propreté puis retiré avant la suppression (git refuse un fichier
  non suivi), jamais avant le contrôle ;
- la session de discussion liée à la carte (ligne `sessions` titrée `t_<id> · …`), via
  `hermes -p <profil> sessions delete <id> --yes`. Si la session a parlé il y a moins de deux
  minutes, la suppression est reportée au tick suivant ; si le CLI la refuse, c'est signalé en
  commentaire sans bloquer le reste.

La branche locale et distante est **toujours conservée** : le nettoyage ne supprime aucune branche
et ne pousse jamais. Chaque nettoyage est consigné par un commentaire sur la carte
(worktree, session, état de la branche).

Seules les cartes terminées **après** l'installation sont nettoyées (epoch enregistrée à
l'installation) : les worktrees antérieurs ne sont pas touchés.

### Mise en service

```bash
cd source_code
make kanban-hooks-install   # hook + copie du script dans le profil + core.hooksPath absolu + job cron + epoch
make kanban-hooks-status    # une ligne par contrôle ET par worktree enregistré ; sort en erreur si incomplet
make kanban-cleanup-run     # rejoue le balayage à la main (idempotent)
```

`core.hooksPath` est une configuration **partagée par tous les worktrees** : une seule installation
suffit. Les cibles installées vivent **hors du dépôt** (dossier du profil Hermes `portfolio-dev`),
donc aucun worktree supprimé n'emporte le cron qui l'a supprimé ; la version de référence reste
celle du dépôt (`.githooks/post-commit`, `scripts/kanban_card.py`) et `make kanban-hooks-status`
signale toute dérive (« hook à jour », « copie à jour ») ainsi qu'un wrapper qui viserait un
worktree. L'install lancée depuis un worktree fonctionne (copie de la branche courante) mais
affiche un avertissement : **après le merge sur `main`, relancer `make kanban-hooks-install`
depuis le checkout principal** pour que la racine principale redevienne la source prioritaire.

**Sans `make kanban-hooks-install`, les deux automatismes sont inactifs** : `make
kanban-hooks-status` le dit explicitement (sortie en erreur), il n'y a pas de dégradation
silencieuse.

Limites connues :

- si un worker tourne encore sur la carte, `hermes kanban complete` refuse la clôture
  (`LiveClaimError`) : le hook ne force pas, il commente la carte ;
- le nettoyage a la granularité du cron (≤ 1 min), pas de l'instant du commit ;
- la suppression de la session est confiée à `hermes sessions delete` : si le CLI refuse
  (base verrouillée, session archivée autrement), le commentaire de nettoyage le nomme. Un refus
  n'est pas rejoué indéfiniment.

---
