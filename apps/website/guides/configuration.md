---
title: Configuration
description: conflux.config.ts, paths, and token resolution
---

# Configuration

Conflux reads `conflux.config.ts` at the project root (or the path you pass to the CLI). Use `defineConfig` for typed defaults.

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

## Token resolution

| Option      | Behavior                                                  |
| ----------- | --------------------------------------------------------- |
| `token`     | Literal bot token string                                  |
| `env`       | Name of an environment variable to read                   |
| _(omitted)_ | Checks `FLUXER_BOT_TOKEN`, then `BOT_TOKEN`, then `TOKEN` |

Load variables from `.env` automatically in dev and start.

## Paths

| Field         | Default        | Role                          |
| ------------- | -------------- | ----------------------------- |
| `entry`       | `src/index.ts` | Bot module exporting `client` |
| `commandsDir` | `src/commands` | Prefix command modules        |
| `eventsDir`   | `src/events`   | Event handler folders         |
| `outDir`      | `dist`         | Production bundle output      |

## Dev vs production output

| Mode            | Output                     | Notes                              |
| --------------- | -------------------------- | ---------------------------------- |
| `conflux dev`   | `.conflux/`                | Unminified bundle, watch + restart |
| `conflux build` | `outDir` (`dist`)          | Minified production bundle         |
| `conflux start` | Uses `outDir` when present | Falls back to source entry         |

Do not commit `.conflux/`; treat `dist/` as deploy artifacts after `conflux build`.
