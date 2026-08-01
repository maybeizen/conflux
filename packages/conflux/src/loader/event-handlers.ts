import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { Events } from "@fluxerjs/core";

import type { FluxerClientEventName } from "../events/fluxer-events.js";
import type { AnyEventHandler, EventHandlerRegistry } from "../events/types.js";
import { isLoadableModule } from "./directory-modules.js";

const FLUXER_EVENT_NAMES = new Set<string>(Object.values(Events));

function isAnyEventHandler(value: unknown): value is AnyEventHandler {
  return typeof value === "function";
}

function listEventNames(eventsDir: string): string[] {
  if (!existsSync(eventsDir)) {
    return [];
  }
  return readdirSync(eventsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function sortedHandlerFiles(eventDir: string): string[] {
  return readdirSync(eventDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isLoadableModule(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => join(eventDir, name));
}

function assertKnownEventName(eventName: string, eventsDir: string): void {
  if (!FLUXER_EVENT_NAMES.has(eventName)) {
    throw new Error(
      `Unknown event folder "${eventName}" under ${eventsDir}. Name the folder with a Fluxer event string (for example ready, messageCreate). See Events in @fluxerjs/core.`,
    );
  }
}

export async function loadEventHandlerRegistry(eventsDir: string): Promise<EventHandlerRegistry> {
  const registry: EventHandlerRegistry = new Map();
  for (const eventName of listEventNames(eventsDir)) {
    assertKnownEventName(eventName, eventsDir);
    const eventDir = join(eventsDir, eventName);
    const handlers: AnyEventHandler[] = [];
    for (const filePath of sortedHandlerFiles(eventDir)) {
      const module = await import(pathToFileURL(filePath).href);
      const handler = module.default;
      if (!isAnyEventHandler(handler)) {
        throw new Error(`Event handler must default-export a function: ${filePath}`);
      }
      handlers.push(handler);
    }
    if (handlers.length > 0) {
      registry.set(eventName as FluxerClientEventName, handlers);
    }
  }
  return registry;
}
