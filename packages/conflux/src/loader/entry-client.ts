import { pathToFileURL } from "node:url";

import { Client } from "@fluxerjs/core";

import type { Conflux } from "../core/conflux.js";

function isFluxerClient(value: unknown): value is Client {
  if (value instanceof Client) {
    return true;
  }
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.login === "function" &&
    typeof candidate.on === "function" &&
    typeof candidate.once === "function"
  );
}

export type EntryModule = {
  client: Client;
  configure?: (conflux: Conflux) => void | Promise<void>;
};

export async function loadEntryModule(entryPath: string): Promise<EntryModule> {
  const entryModule = await import(pathToFileURL(entryPath).href);
  const namedExport = entryModule.client;
  let client: Client | null = null;
  if (isFluxerClient(namedExport)) {
    client = namedExport;
  } else if (isFluxerClient(entryModule.default)) {
    client = entryModule.default;
  }
  if (!client) {
    throw new Error(
      `Conflux entry must export a @fluxerjs/core Client as named export \`client\` or as default export: ${entryPath}`,
    );
  }
  const configure = entryModule.configure;
  if (configure !== undefined && typeof configure !== "function") {
    throw new Error(`Conflux entry export \`configure\` must be a function: ${entryPath}`);
  }
  return { client, configure };
}

export async function loadEntryClient(entryPath: string): Promise<Client> {
  const entry = await loadEntryModule(entryPath);
  return entry.client;
}
