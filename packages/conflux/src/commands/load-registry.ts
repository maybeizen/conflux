import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

import { discoverCommandPaths, type DiscoveredCommandPaths } from "./discover-paths.js";
import type {
  CommandData,
  CommandMiddleware,
  CommandRegistry,
  LoadedCommand,
  MessageCommand,
  MessageCommandAfter,
} from "./types.js";
import { validateCommandTriggers, validateDiscoveredMiddleware } from "./validate-registry.js";

function isCommandData(value: unknown): value is CommandData {
  if (!value || typeof value !== "object") {
    return false;
  }
  const data = value as CommandData;
  return typeof data.name === "string" && data.name.length > 0;
}

function isMessageCommand(value: unknown): value is MessageCommand {
  return typeof value === "function";
}

function readMiddleware(module: Record<string, unknown>): CommandMiddleware {
  const candidate = module.middleware ?? module.default;
  if (!candidate || typeof candidate !== "object") {
    throw new Error("Middleware module must default-export or export `middleware`");
  }
  const middleware = candidate as CommandMiddleware;
  if (
    typeof middleware.beforeExecute !== "function" ||
    typeof middleware.afterExecute !== "function"
  ) {
    throw new Error("Middleware must define beforeExecute and afterExecute functions");
  }
  return middleware;
}

async function loadMiddlewareFile(filePath: string): Promise<CommandMiddleware> {
  const module = await import(pathToFileURL(filePath).href);
  try {
    return readMiddleware(module as Record<string, unknown>);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${message}: ${filePath}`);
  }
}

async function loadCommandFile(filePath: string): Promise<LoadedCommand> {
  const module = await import(pathToFileURL(filePath).href);
  const data = module.data;
  if (!isCommandData(data)) {
    throw new Error(`Command module must export \`data\` with a non-empty name: ${filePath}`);
  }
  const message = module.message;
  if (!isMessageCommand(message)) {
    throw new Error(`Command module must export \`message\` function: ${filePath}`);
  }
  const namedAfter = module.after;
  const after: MessageCommandAfter | undefined =
    typeof namedAfter === "function"
      ? namedAfter
      : typeof message.after === "function"
        ? message.after
        : undefined;
  return {
    filePath,
    directory: dirname(filePath),
    data,
    message,
    after,
  };
}

async function loadMiddlewareMaps(discovered: DiscoveredCommandPaths): Promise<{
  globalMiddleware: CommandMiddleware | null;
  directoryMiddleware: Map<string, CommandMiddleware>;
  commandMiddleware: Map<string, CommandMiddleware>;
}> {
  const globalMiddleware =
    discovered.globalMiddlewarePaths.length === 1
      ? await loadMiddlewareFile(discovered.globalMiddlewarePaths[0]!)
      : null;
  const directoryMiddleware = new Map<string, CommandMiddleware>();
  for (const [dir, filePath] of discovered.directoryMiddlewarePaths) {
    directoryMiddleware.set(dir, await loadMiddlewareFile(filePath));
  }
  const commandMiddleware = new Map<string, CommandMiddleware>();
  for (const [key, filePath] of discovered.commandMiddlewarePaths) {
    commandMiddleware.set(key, await loadMiddlewareFile(filePath));
  }
  return { globalMiddleware, directoryMiddleware, commandMiddleware };
}

export async function loadCommandRegistry(commandsDir: string): Promise<CommandRegistry> {
  const discovered = discoverCommandPaths(commandsDir);
  validateDiscoveredMiddleware(discovered, commandsDir);
  const commands: LoadedCommand[] = [];
  for (const filePath of discovered.commandPaths) {
    commands.push(await loadCommandFile(filePath));
  }
  validateCommandTriggers(commands);
  const middleware = await loadMiddlewareMaps(discovered);
  const byTrigger = new Map<string, LoadedCommand>();
  for (const command of commands) {
    byTrigger.set(command.data.name.toLowerCase(), command);
    for (const alias of command.data.aliases ?? []) {
      byTrigger.set(alias.toLowerCase(), command);
    }
  }
  return {
    commands,
    byTrigger,
    ...middleware,
  };
}
