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
