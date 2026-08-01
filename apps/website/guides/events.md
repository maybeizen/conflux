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

## API

The [`stopAllEvents`](/api/functions/stopallevents) function is also exported from the package for advanced use.
