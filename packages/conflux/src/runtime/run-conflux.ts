import { existsSync } from "node:fs";

import { loadCommandRegistry } from "../commands/load-registry.js";
import { registerConfluxCommands } from "../commands/register-commands.js";
import { loadConfluxConfig } from "../config/load-config.js";
import type { ConfluxOptions } from "../config/types.js";
import { Conflux } from "../core/conflux.js";
import { loadProjectEnv, resolveBotToken } from "../env/index.js";
import { resetEventPipeline } from "../events/pipeline.js";
import { registerConfluxEventHandlers } from "../events/register-handlers.js";
import { loadEntryModule, loadEventHandlerRegistry } from "../loader/index.js";
import { setConfig } from "./state.js";

export type RunConfluxOptions = ConfluxOptions & {
  entry?: string;
  eventsDir?: string;
  commandsDir?: string;
  production?: boolean;
};

export async function runConflux(options: RunConfluxOptions = {}): Promise<Conflux> {
  const root = options.root ?? process.cwd();
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
  const token = resolveBotToken(config);
  setConfig(config);
  resetEventPipeline();
  if (!existsSync(config.entry)) {
    throw new Error(`Conflux entry not found: ${config.entry}`);
  }
  const { client, configure } = await loadEntryModule(config.entry);
  const conflux = new Conflux({ root: config.root });
  conflux.client = client;
  await configure?.(conflux);
  const commandRegistry = await loadCommandRegistry(config.commandsDir);
  const eventHandlers = await loadEventHandlerRegistry(config.eventsDir);
  registerConfluxEventHandlers(client, conflux, eventHandlers);
  registerConfluxCommands(client, conflux, commandRegistry, config.commandsDir);
  await client.login(token);
  return conflux;
}
