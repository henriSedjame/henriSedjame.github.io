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
