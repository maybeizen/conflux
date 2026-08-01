---
title: Middleware
description: Global, directory, and per-command middleware chains
---

# Middleware

Middleware wraps prefix command execution with `beforeExecute` and `afterExecute` hooks.

## File patterns

| File                                      | Scope                                  |
| ----------------------------------------- | -------------------------------------- |
| `+global-middleware.ts` (one per project) | All commands                           |
| `+middleware.ts` in a folder              | Commands in that folder and subfolders |
| `+<name>.middleware.ts` next to a command | Command whose `data.name` is `<name>`  |

Example layout:

```
src/commands/
  +global-middleware.ts
  +middleware.ts
  ping.ts
  [utility]/
    +middleware.ts
    +pong.middleware.ts
    pong.ts
```

## Global middleware

```ts
import type { CommandMiddleware } from "@confluxjs/conflux/commands";

const middleware: CommandMiddleware = {
  async beforeExecute(ctx) {
    console.log(`[global] before ${ctx.commandName}`);
  },
  async afterExecute(ctx) {
    console.log(`[global] after ${ctx.commandName}`);
  },
};

export default middleware;
```

## Execution order

Middleware runs in this order:

1. Global middleware (`+global-middleware.ts`)
2. Directory middleware from `commandsDir` root down to the command folder (`+middleware.ts` per directory)
3. Command-specific middleware (`+<name>.middleware.ts`)

For each stage, `beforeExecute` runs forward. After the command runs (and optional command `after`), `afterExecute` runs in reverse.

Permission and guild filters that fail are skipped silently (no automatic reply).

## Types

See [`CommandMiddleware`](/api/type-aliases/commandmiddleware) in the API reference.
