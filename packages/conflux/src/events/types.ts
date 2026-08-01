import type { Client, ClientEvents } from "@fluxerjs/core";

import type { Conflux } from "../core/conflux.js";
import type { FluxerClientEventName } from "./fluxer-events.js";

export type { FluxerClientEventName };

export type EventHandlerContext = {
  client: Client;
  conflux: Conflux;
  stopAllEvents: () => void;
};

export type EventHandler<K extends FluxerClientEventName = FluxerClientEventName> = (
  ...args: [...ClientEvents[K], EventHandlerContext]
) => void | Promise<void>;

export type AnyEventHandler = (...args: unknown[]) => void | Promise<void>;

export type EventHandlerRegistry = Map<FluxerClientEventName, AnyEventHandler[]>;
