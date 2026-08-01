---
title: Manual installation
description: Add Conflux to an existing Fluxer bot project
---

# Manual installation

Use this path when you are not using `create-conflux` or you are wiring Conflux into an existing repository.

## Dependencies

<PackageManagerSwitcher
  defaultManager="pnpm"
  npm="npm add @confluxjs/conflux @fluxerjs/core\nnpm add -D @types/node typescript"
  pnpm="pnpm add @confluxjs/conflux @fluxerjs/core\npnpm add -D @types/node typescript"
  yarn="yarn add @confluxjs/conflux @fluxerjs/core\nyarn add -D @types/node typescript"
  bun="bun add @confluxjs/conflux @fluxerjs/core\nbun add -d @types/node typescript"
/>

Install **`typescript`** for editor checking and **`@types/node`** for Node globals (`process`, `import.meta`, and so on). Conflux bundles your bot; you do not need a separate TypeScript emit step for production.

## TypeScript

Add a `tsconfig.json` at the project root. This baseline works with Conflux defaults:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext",
    "verbatimModuleSyntax": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "types": ["node"],
    "allowJs": true,
    "noEmit": true,
    "rootDir": "."
  },
  "include": ["src", "conflux.config.ts"]
}
```

## Project layout

```
conflux.config.ts
.env
src/
  index.ts
  commands/
  events/
```

## Configuration file

```ts
import { defineConfig } from "@confluxjs/conflux";

export default defineConfig({
  outDir: "dist",
  entry: "src/index.ts",
  eventsDir: "src/events",
  commandsDir: "src/commands",
  env: "FLUXER_BOT_TOKEN",
});
```

See [Configuration](/guides/configuration) for every option.

## Environment

Create `.env` in the project root:

```text
FLUXER_BOT_TOKEN=
```

::: warning
Never commit `.env` or bot tokens to version control. Use your host’s secret manager in production.
:::

## Entry module

```ts
import { Client } from "@fluxerjs/core";

const client = new Client({ intents: 0 });

export { client };
```

Configure prefixes in `conflux.config.ts` with `prefix: "!"` or `prefix: ["!", "?"]`.

## Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "conflux dev",
    "build": "conflux build",
    "start": "conflux start"
  }
}
```

<PackageManagerSwitcher
  defaultManager="pnpm"
  npm="npm run dev"
  pnpm="pnpm dev"
  yarn="yarn dev"
  bun="bun run dev"
/>

::: tip Local development
Run the dev script after setting `FLUXER_BOT_TOKEN` in `.env`. Conflux watches your source and restarts the bot on change.
:::
