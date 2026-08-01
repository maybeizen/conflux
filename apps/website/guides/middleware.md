---
title: Middleware
description: Global, directory, and per-command middleware chains
---

# Middleware

Middleware wraps prefix command handlers. Each middleware module can run logic **before** the command body and **after** it finishes. Use it for logging, cooldowns, shared guards, or cleanup that should not live in every command file.

Middleware only runs when a message becomes a **matched command**: valid prefix, known trigger (`data.name` or alias), guild filter, and permission checks all pass first. Failed checks exit silently with no middleware and no handler.

## Middleware types

Conflux discovers three kinds of middleware files under `commandsDir`. All use the `+` filename convention so they are not treated as commands.

| Type        | Filename pattern             | Scope                                                     |
| ----------- | ---------------------------- | --------------------------------------------------------- |
| Global      | `+global-middleware.ts`      | Every command under `commandsDir`                         |
| Directory   | `+middleware.ts`             | Commands in that folder and all nested subfolders         |
| Per-command | `+<data.name>.middleware.ts` | One command, matched by `data.name` in the same directory |

### Global middleware

- **File name:** exactly `+global-middleware` plus a loadable extension (`.ts`, `.js`, and so on).
- **Location:** anywhere under `commandsDir` (typically the root).
- **Limit:** at most **one** global file in the tree. `conflux build` fails if more than one is found.

Use global middleware for bot-wide concerns: request logging, global cooldown tables, or metrics.

### Directory middleware

- **File name:** exactly `+middleware` plus extension.
- **Location:** inside a folder that contains commands (or subfolders with commands).
- **Scope:** applies to every command whose file lives in that directory **or** in a subdirectory beneath it.

When a command runs, Conflux walks from `commandsDir` down to the command’s folder and collects every `+middleware.ts` on that path, in order from root to leaf.

Example: a command in `src/commands/[utility]/pong.ts` runs directory middleware from `src/commands/+middleware.ts` (if present) and then `src/commands/[utility]/+middleware.ts` (if present). It does **not** run middleware from sibling folders such as `src/commands/admin/`.

### Per-command middleware

- **File name:** `+` + **`data.name`** + `.middleware` + extension — not the command **file** name.
- **Location:** same directory as the command module.

If `pong.ts` exports `data.name: "pong"`, the middleware file must be `+pong.middleware.ts` beside `pong.ts`. If `data.name` is `reload` but the file is `r.ts`, the middleware file is still `+reload.middleware.ts`.

Per-command middleware runs last in the chain, after global and all directory layers.

## Example layout

```
src/commands/
  +global-middleware.ts     # all commands
  +middleware.ts            # all commands (root directory layer)
  ping.ts
  [utility]/
    +middleware.ts          # only commands under [utility]/
    +pong.middleware.ts     # only command with data.name "pong"
    pong.ts
  admin/
    ban.ts                  # gets global + root +middleware only
```

## Module requirements

Each middleware file must export a [`CommandMiddleware`](/api/type-aliases/commandmiddleware) object:

- **`beforeExecute(ctx)`** — required function (sync or async).
- **`afterExecute(ctx)`** — required function (sync or async).

Valid exports:

```ts
import type { CommandMiddleware } from "@confluxjs/conflux";

const middleware: CommandMiddleware = {
  async beforeExecute(ctx) {
    console.log(`before ${ctx.commandName}`);
  },
  async afterExecute(ctx) {
    console.log(`after ${ctx.commandName}`);
  },
};

export default middleware;
```

Named export is also supported:

```ts
export const middleware: CommandMiddleware = {/* ... */};
```

If the export is missing, not an object, or either hook is not a function, loading fails with an error that includes the file path.

Any other `+*.ts` file under `commandsDir` that is not one of the patterns above causes discovery to fail with `Unrecognized middleware file`.

## Execution order

For a single invocation, Conflux builds a linear chain, then runs hooks in two phases.

**Chain assembly (before hooks):**

1. Global middleware (if present)
2. Directory middleware from `commandsDir` → … → command folder (each `+middleware.ts` on that path, root first)
3. Per-command middleware for `data.name` (if present)

**Runtime sequence:**

1. All `beforeExecute` hooks, **forward** (global → directories → command)
2. Command `message` handler
3. Optional command `after` hook ([`MessageCommandAfter`](/api/type-aliases/messagecommandafter)), if exported as `after` or `message.after`
4. All `afterExecute` hooks, **reverse** (command → directories → global)

```
beforeExecute:  [global] → [dir root] → [dir nested] → [command]
handler:        message(ctx)
after hook:     after(ctx)          (optional, command module only)
afterExecute:   [command] → [dir nested] → [dir root] → [global]
```

Middleware does not run for messages that are not commands, unknown triggers, wrong guild (`data.guilds`), or failed permission checks (`userPermissions` / `botPermissions`). Those filters run **before** the chain is built.

## Context

Every hook receives the same [`CommandContext`](/api/type-aliases/commandcontext) as the command handler:

- `message`, `client`, `conflux`
- `commandName` — trigger as typed (before normalization)
- `data` — command metadata
- `args()` — argument tokens after the command name

Use `ctx` in `beforeExecute` to attach state on side channels (module-level maps keyed by message id, and so on) that `afterExecute` reads for cleanup.

## Command `after` vs middleware

| Mechanism          | Defined in         | Runs when                                         |
| ------------------ | ------------------ | ------------------------------------------------- |
| `after` on command | Command module     | After `message`, before middleware `afterExecute` |
| `afterExecute`     | Middleware modules | After command `after`, in reverse chain order     |

Prefer command `after` for logic tied to one handler. Prefer middleware `afterExecute` for shared teardown in a directory or globally.

## Build-time validation

When the command registry loads (dev and build):

- Duplicate command names or aliases across files → error
- More than one `+global-middleware` file → error
- Invalid middleware export → error at load time

Per-command middleware files for a non-existent `data.name` are not validated against commands; they simply never run until a matching command exists in that directory.

## Related

- [Commands](/guides/commands) — `data`, triggers, and prefix configuration
- [`CommandMiddleware`](/api/type-aliases/commandmiddleware) — API type reference
