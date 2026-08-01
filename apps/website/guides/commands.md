---
title: Commands
description: Prefix commands, groups, and CommandData
---

# Commands

Prefix commands live under `commandsDir` (default `src/commands`). Each module exports `data` and `message`.

## CommandData

At minimum, set `data.name`. Optional `aliases` register extra invocations.

```ts
import type { MessageCommand } from "@confluxjs/conflux/commands";

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
