---
title: Manual installation
description: Add Conflux to an existing Fluxer bot project
---

# Manual installation

Use this path when you are not using `create-conflux` or you are wiring Conflux into an existing repository.

## Dependencies

<PackageManagerSwitcher
  defaultManager="bun"
  npm="npm add @confluxjs/conflux @fluxerjs/core\nnpm add -D @confluxjs/tsconfig typescript"
  pnpm="pnpm add @confluxjs/conflux @fluxerjs/core\npnpm add -D @confluxjs/tsconfig typescript"
  yarn="yarn add @confluxjs/conflux @fluxerjs/core\nyarn add -D @confluxjs/tsconfig typescript"
  bun="bun add @confluxjs/conflux @fluxerjs/core\nbun add -d @confluxjs/tsconfig typescript"
/>

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
import { defineConfig } from "@confluxjs/conflux/config";

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
import type { Conflux } from "@confluxjs/conflux";

const client = new Client({ intents: 0 });

export async function configure(conflux: Conflux) {
  conflux.setPrefix(async () => ["!"]);
}

export { client };
```

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
  defaultManager="bun"
  npm="npm run dev"
  pnpm="pnpm dev"
  yarn="yarn dev"
  bun="bun run dev"
/>

::: tip Local development
Run the dev script after setting `FLUXER_BOT_TOKEN` in `.env`. Conflux watches your source and restarts the bot on change.
:::
