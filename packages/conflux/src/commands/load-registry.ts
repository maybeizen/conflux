import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

import { discoverCommandPaths, type DiscoveredCommandPaths } from "./discover-paths.js";
import { type MiddlewareMaps, resolveMiddlewareChain } from "./resolve-middleware.js";
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
  if (typeof data.name !== "string" || data.name.length === 0) {
    return false;
  }
  if (data.aliases !== undefined && !Array.isArray(data.aliases)) {
    return false;
  }
  if (data.guilds !== undefined && !Array.isArray(data.guilds)) {
    return false;
  }
  return true;
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
    middleware: [],
  };
}

async function loadMiddlewareMaps(discovered: DiscoveredCommandPaths): Promise<MiddlewareMaps> {
  const directoryEntries = [...discovered.directoryMiddlewarePaths];
  const commandEntries = [...discovered.commandMiddlewarePaths];
  const [globalMiddleware, directoryLoaded, commandLoaded] = await Promise.all([
    discovered.globalMiddlewarePaths.length === 1
      ? loadMiddlewareFile(discovered.globalMiddlewarePaths[0]!)
      : Promise.resolve(null),
    Promise.all(
      directoryEntries.map(
        async ([dir, filePath]) => [dir, await loadMiddlewareFile(filePath)] as const,
      ),
    ),
    Promise.all(
      commandEntries.map(
        async ([key, filePath]) => [key, await loadMiddlewareFile(filePath)] as const,
      ),
    ),
  ]);
  return {
    globalMiddleware,
    directoryMiddleware: new Map(directoryLoaded),
    commandMiddleware: new Map(commandLoaded),
  };
}

export async function loadCommandRegistry(commandsDir: string): Promise<CommandRegistry> {
  const discovered = discoverCommandPaths(commandsDir);
  validateDiscoveredMiddleware(discovered, commandsDir);
  const [loadedCommands, middleware] = await Promise.all([
    Promise.all(discovered.commandPaths.map(loadCommandFile)),
    loadMiddlewareMaps(discovered),
  ]);
  validateCommandTriggers(loadedCommands);
  const commands = loadedCommands.map((command) => ({
    ...command,
    middleware: resolveMiddlewareChain(middleware, command, commandsDir),
  }));
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
