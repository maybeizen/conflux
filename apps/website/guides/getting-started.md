---
title: Getting started
description: Create a Conflux bot and run it locally
---

# Getting started

## Create a project

<PackageManagerSwitcher
  defaultManager="bun"
  npm="npm create @confluxjs/create-conflux@latest my-bot"
  pnpm="pnpm create @confluxjs/create-conflux my-bot"
  yarn="yarn create @confluxjs/create-conflux my-bot"
  bun="bunx create-conflux my-bot"
/>

```bash
cd my-bot
cp .env.example .env
```

::: tip
Set `FLUXER_BOT_TOKEN` in `.env` using a token from the [Fluxer developer portal](https://fluxer.js.org/guides/installation/).
:::

## Run the bot

<PackageManagerSwitcher
  defaultManager="bun"
  npm="npm install\nnpm run dev"
  pnpm="pnpm install\npnpm dev"
  yarn="yarn install\nyarn dev"
  bun="bun install\nbun run dev"
/>

Use your package manager’s build script before deploying, then run `start` in production.

Conflux loads `conflux.config.ts`, reads your token from `.env`, imports your entry module, and calls `login` on the `Client` you export — you never call `client.login()` yourself.

## CLI commands

| Command         | Purpose                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `conflux dev`   | Bundle to `.conflux/` (unminified), watch source, and restart on change |
| `conflux build` | Production bundle to `outDir` (default `dist`, minified)                |
| `conflux start` | Run production (`outDir` when present, otherwise source entry)          |
| `conflux run`   | Alias for `conflux dev`                                                 |

## Next steps

- [Manual installation](/guides/manual-installation) — add Conflux to an existing project
- [Configuration](/guides/configuration) — `defineConfig`, paths, and tokens
- [Commands](/guides/commands) — prefix commands and groups
- [Events](/guides/events) — handler folders and ordering
- [Middleware](/guides/middleware) — global, directory, and per-command chains

## Minimal bot entry

Create a `@fluxerjs/core` `Client` in your entry file (default `src/index.ts`) and export it as `client`:

```ts
import { Client } from "@fluxerjs/core";

const client = new Client({ intents: 0 });

export { client };
```

Set command prefixes in `conflux.config.ts` (see [Configuration](/guides/configuration#command-prefix)).

::: info
Optional `configure(conflux)` runs before commands load and can override config (for example `setPrefix` for dynamic prefixes). Conflux registers handlers and prefix commands before calling `login`.
:::
