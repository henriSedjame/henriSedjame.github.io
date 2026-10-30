run_test:
	npm run test

gc:
	cd src/app/components && ng generate component $(name) \
	&& cd $(name) && touch index.ts && echo "export * from './$(name)';" > index.ts \
	&& cd .. && echo "export * from './$(name)';" >> index.ts \
	&& git add ./$(name)

gcc:
	cd src/app/components/$(parent) && ng generate component $(name) --prefix=$(prefix) \
	&& cd $(name) && touch index.ts && echo "export * from './$(name)';" > index.ts \
	&& cd .. && echo "export * from './$(name)';" >> index.ts \
	&& git add ./$(name)

gpc:
	cd src/app/components/pages && ng generate component $(name) -p=page  \
	&& cd $(name) && touch index.ts && echo "export * from './$(name)';" > index.ts \
	&& cd .. \
	&& git add ./$(name)


gpcc:
	cd src/app/components/pages/$(page) && ng generate component $(name)  \
	&& cd $(name) && touch index.ts && echo "export * from './$(name)';" > index.ts \
	&& cd .. \
	&& git add ./$(name)


gfc:
	cd src/app/features/$(feature)/components && ng generate component $(name)  \
	&& cd $(name) && touch index.ts && echo "export * from './$(name)';" > index.ts \
	&& cd .. && echo "export * from './$(name)';" >> index.ts \
	&& git add ./$(name)


localize:
	ng extract-i18n --output-path src/locale \
  && rm -f src/locale/messages.en.xlf \
  && cp src/locale/messages.xlf src/locale/messages.en.xlf \
	&& git add src/locale/messages.xlf src/locale/messages.en.xlf

lint_fix:
	npm run lint:fix

# --- Outillage kanban (voir ../README.md § Outillage kanban) -------------------
# Clôture d'une carte sur commit + nettoyage worktree/session au passage en done.
# Le code vit à la racine du dépôt : ../.githooks/post-commit et ../scripts/kanban_card.py.
# Depuis un worktree, REPO_ROOT est le worktree : le script résout lui-même la
# racine principale pour les cibles installées (hook, copie, wrapper du cron), et
# `install` prévient qu'il faut relancer depuis le checkout principal après merge.
REPO_ROOT := $(abspath $(CURDIR)/..)

kanban-hooks-install:
	python3 $(REPO_ROOT)/scripts/kanban_card.py install --repo $(REPO_ROOT)

kanban-hooks-status:
	python3 $(REPO_ROOT)/scripts/kanban_card.py status --repo $(REPO_ROOT)

kanban-cleanup-run:
	python3 $(REPO_ROOT)/scripts/kanban_card.py sweep --repo $(REPO_ROOT)

.PHONY: kanban-hooks-install kanban-hooks-status kanban-cleanup-run

