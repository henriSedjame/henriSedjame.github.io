// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig(
  {
    files: ["**/*.ts"],
    ignores: ["**/*.spec.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      quotes: [
        2, "single", { avoidEscape: true }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "",
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/no-unused-vars" : [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": [
        "off",
        {
          ignoreRestArgs: true,
        },
      ],
      "@typescript-eslint/ban-ts-comment": [
        "off"
      ],
      "@typescript-eslint/no-empty-function": [
        "warn"
      ],
      "@typescript-eslint/consistent-type-definitions": [
        "off"
      ],
      "@typescript-eslint/no-empty-object-type":[
        "off"
      ]

    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/click-events-have-key-events": [
        "off"
      ],
      "@angular-eslint/template/interactive-supports-focus": [
        "off"
      ]
    },
  }
);
