import { statSync } from "node:fs";
import { resolve } from "node:path";

import { loadCommandRegistry } from "../commands/load-registry.js";
import { registerConfluxCommands } from "../commands/register-commands.js";
import { loadConfluxConfig } from "../config/load-config.js";
import type { ConfluxOptions } from "../config/types.js";
import { Conflux } from "../core/conflux.js";
import { loadProjectEnv, resolveBotToken } from "../env/index.js";
import { resetEventPipeline } from "../events/pipeline.js";
import { registerConfluxEventHandlers } from "../events/register-handlers.js";
import { loadEntryModule, loadEventHandlerRegistry } from "../loader/index.js";
import { assertPathInsideRoot } from "../util/path-safety.js";
import { setConfig } from "./state.js";

export type RunConfluxOptions = ConfluxOptions & {
  entry?: string;
  eventsDir?: string;
  commandsDir?: string;
  production?: boolean;
};

function isExistingFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

export async function runConflux(options: RunConfluxOptions = {}): Promise<Conflux> {
  const root = resolve(options.root ?? process.cwd());
  if (options.production) {
    process.env.NODE_ENV = "production";
  }
  loadProjectEnv(root);
  const loaded = await loadConfluxConfig(root);
  const config = {
    ...loaded,
    entry: options.entry ?? loaded.entry,
    eventsDir: options.eventsDir ?? loaded.eventsDir,
    commandsDir: options.commandsDir ?? loaded.commandsDir,
  };
  assertPathInsideRoot(root, config.entry, "entry");
  assertPathInsideRoot(root, config.commandsDir, "commandsDir");
  assertPathInsideRoot(root, config.eventsDir, "eventsDir");
  const token = resolveBotToken(config);
  setConfig(config);
  resetEventPipeline();
  if (!isExistingFile(config.entry)) {
    throw new Error(`Conflux entry not found: ${config.entry}`);
  }
  const { client, configure } = await loadEntryModule(config.entry);
  const conflux = new Conflux({ root: config.root });
  conflux.client = client;
  conflux.setPrefix(() => config.prefix);
  await configure?.(conflux);
  const [commandRegistry, eventHandlers] = await Promise.all([
    loadCommandRegistry(config.commandsDir),
    loadEventHandlerRegistry(config.eventsDir),
  ]);
  registerConfluxEventHandlers(client, conflux, eventHandlers);
  registerConfluxCommands(client, conflux, commandRegistry);
  await client.login(token);
  return conflux;
}
