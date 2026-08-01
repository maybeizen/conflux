import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

const tsFiles = [
  "packages/conflux/**/*.ts",
  "packages/create-conflux/**/*.ts",
  "scripts/**/*.ts",
  "apps/website/.vitepress/**/*.ts",
];

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.vitepress/dist/**",
      "**/.vitepress/cache/**",
      "apps/website/api/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/.conflux/**",
      "packages/conflux/dist/**",
      "packages/create-conflux/dist/**",
      "packages/conflux/tsdown.config.ts",
      "packages/create-conflux/tsdown.config.ts",
      "bun.lock",
      "**/*.md",
      "**/*.yml",
      "**/*.yaml",
      "**/*.json",
      ".github/**",
    ],
  },
  eslint.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: tsFiles,
  })),
  {
    files: tsFiles,
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...pluginVue.configs["flat/recommended"].map((config) => ({
    ...config,
    files: ["apps/website/.vitepress/**/*.{vue,ts}"],
  })),
  {
    files: ["apps/website/.vitepress/**/*.{vue,ts}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "vue/max-attributes-per-line": "off",
      "vue/html-self-closing": "off",
    },
  },
);
