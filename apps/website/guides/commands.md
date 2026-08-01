---
title: Commands
description: Prefix commands, groups, and CommandData
---

# Commands

Prefix commands live under `commandsDir` (default `src/commands`). Each module exports `data` and `message`.

## Command prefix

Conflux only treats a message as a command when it starts with a configured prefix, then the command name (or alias), then optional arguments.

Set prefixes in `conflux.config.ts`:

```ts
import { defineConfig } from "@confluxjs/conflux";

export default defineConfig({
  prefix: "!",
});
```

Multiple prefixes are supported. The bot tries each prefix in array order and uses the first match:

```ts
export default defineConfig({
  prefix: ["!", "?"],
});
```

With `prefix: ["!", "?"]`, both `!ping` and `?ping` invoke the same command. Omitted `prefix` defaults to `"!"`.

For prefixes that depend on runtime state (per-guild values, async lookup, and so on), export `configure(conflux)` from your entry module and call [`setPrefix`](/api/classes/conflux#setprefix) **after** config is applied. That overrides the static `prefix` from config.

See [Configuration — Command prefix](/guides/configuration#command-prefix) for the full option reference.

## CommandData

At minimum, set `data.name`. Optional fields:

| Field             | Purpose                                      |
| ----------------- | -------------------------------------------- |
| `aliases`         | Extra invocations for the same handler       |
| `userPermissions` | Member permissions required in guilds        |
| `botPermissions`  | Bot permissions required in guilds           |
| `guilds`          | If set, command only runs in those guild IDs |

```ts
import type { MessageCommand } from "@confluxjs/conflux";

export const data = {
  name: "say",
};

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply(ctx.args().join(" "));
};
```

With aliases:

```ts
export const data = {
  name: "pong",
  aliases: ["echo"],
};

export const message: MessageCommand = async (ctx) => {
  const text = ctx.args().join(" ") || "Pong!";
  await ctx.message.reply(text);
};
```

## Group folders

Folders like `[utility]/` are organizational only. Routing uses `data.name` and `aliases`, not the folder name.

```
src/commands/
  ping.ts
  [utility]/
    pong.ts
```

## Context

`MessageCommand` receives a context with the matched message, resolved command name, prefix, and `args()` for tokens after the command.

## Validation

`conflux build` validates the registry: unique names and aliases, and at most one `+global-middleware` file.

See [Middleware](/guides/middleware) for hooks around command execution.
