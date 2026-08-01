import type { Client } from "@fluxerjs/core";

import type { Conflux } from "../core/conflux.js";
import { isEventPipelineHalted, stopAllEvents } from "./pipeline.js";
import type { AnyEventHandler, EventHandlerContext, EventHandlerRegistry } from "./types.js";

function createHandlerContext(client: Client, conflux: Conflux): EventHandlerContext {
  return {
    client,
    conflux,
    stopAllEvents,
  };
}

async function runHandlerBatch(
  handlers: AnyEventHandler[],
  fluxerArgs: unknown[],
  ctx: EventHandlerContext,
  conflux: Conflux,
  eventName: string,
): Promise<void> {
  for (const handler of handlers) {
    if (isEventPipelineHalted()) {
      break;
    }
    try {
      await handler(...fluxerArgs, ctx);
    } catch (error) {
      await conflux.reportError(error, { scope: "event", eventName });
    }
  }
}

export function registerConfluxEventHandlers(
  client: Client,
  conflux: Conflux,
  registry: EventHandlerRegistry,
): void {
  for (const [eventName, handlers] of registry) {
    client.on(eventName, (...fluxerArgs: unknown[]) => {
      if (isEventPipelineHalted()) {
        return;
      }
      const ctx = createHandlerContext(client, conflux);
      void runHandlerBatch(handlers, fluxerArgs, ctx, conflux, eventName).catch(
        (error: unknown) => {
          void conflux.reportError(error, { scope: "event", eventName });
        },
      );
    });
  }
}
