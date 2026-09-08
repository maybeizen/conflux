---
title: Events
description: Event handler folders, ordering, and stopAllEvents
---

# Events

Event handlers live under `eventsDir` (default `src/events`). Each **subfolder name** must match a Fluxer gateway event string from `@fluxerjs/core` `Events` (camelCase), for example `ready/` or `messageCreate/`.

## Handler modules

Each `.ts` or `.js` file in the folder default-exports an `EventHandler`. Files run in **alphabetical order** when the event fires:

```
src/events/
  ready/
    01-log.ts
    02-status.ts
  messageCreate/
    log.ts
```

```ts
import type { EventHandler } from "@confluxjs/conflux";

const handler: EventHandler<"ready"> = (ctx) => {
  console.log(`Ready as ${ctx.client.user?.username ?? "unknown"}`);
};

export default handler;
```

## Handler context

Handlers receive Fluxer event arguments first, then a context object with:

- `client` — your exported Fluxer client
- `conflux` — the Conflux runtime instance
- `stopAllEvents()` — skip remaining handlers in the current batch and ignore all later Conflux event handlers until restart

Calling `stopAllEvents()` is useful when a handler fully owns an event stream (for example after handling a command-like message).

## messageCreate

Prefix commands register a separate `messageCreate` listener from handlers under `events/messageCreate/`. Both can coexist; design handlers to avoid conflicting replies when possible.

`messageCreate` always receives a full `Message`. `message.channel` may be `null` when the channel is uncached; call `message.resolveChannel()` before `send` or `delete`.

## Partial payloads (Fluxer 3)

`EventHandler<K>` uses Fluxer's `ClientEvents`, so uncached delete/update/remove payloads are partial. Check `.partial` (or fetch) before reading `content`, `author`, `nick`, or calling `reply`.

| Event               | Payload                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `messageDelete`     | `PartialMessage` — has `id`, `channelId`, `guildId`, `fetch()`, `resolveChannel()`. No `edit` / `reply` / `react`. |
| `messageUpdate`     | Cached edits are `Message`. Uncached edits are `PartialMessage`.                                                   |
| `guildMemberRemove` | `GuildMember \| PartialGuildMember`. Partial members have `id`, `guildId`, `user`, and `guild`.                    |
| `messageDeleteBulk` | Includes `messages: PartialMessage[]` plus the channel and ids.                                                    |

```ts
import type { EventHandler } from "@confluxjs/conflux";

const handler: EventHandler<"messageDelete"> = (message, ctx) => {
  if (message.partial) {
    console.log("uncached delete", message.id, message.authorId);
    return;
  }
  console.log("cached delete", message.content);
};

export default handler;
```

## Role events

`guildRoleCreate` is still a single `Role`. Fluxer 3 emits update as `(oldRole, role)` and delete as `(role, guildId, roleId)`. `oldRole` on update and `role` on delete are `null` when the role was uncached:

```ts
import type { EventHandler } from "@confluxjs/conflux";

const onUpdate: EventHandler<"guildRoleUpdate"> = (oldRole, role, ctx) => {
  console.log(oldRole?.name, "→", role.name);
};

const onDelete: EventHandler<"guildRoleDelete"> = (role, guildId, roleId, ctx) => {
  console.log(role?.name ?? roleId, "removed from", guildId);
};
```

## API

The [`stopAllEvents`](/api/functions/stopallevents) function is also exported from the package for advanced use.
