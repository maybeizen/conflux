import { dirname } from "node:path";

import type { CommandMiddleware, CommandRegistry, LoadedCommand } from "./types.js";

function directoryChain(commandsDir: string, commandDir: string): string[] {
  const dirs: string[] = [];
  let current = commandDir;
  while (true) {
    dirs.unshift(current);
    if (current === commandsDir) {
      break;
    }
    current = dirname(current);
  }
  return dirs;
}

export function resolveMiddlewareChain(
  registry: CommandRegistry,
  command: LoadedCommand,
  commandsDir: string,
): CommandMiddleware[] {
  const chain: CommandMiddleware[] = [];
  if (registry.globalMiddleware) {
    chain.push(registry.globalMiddleware);
  }
  for (const dir of directoryChain(commandsDir, command.directory)) {
    const middleware = registry.directoryMiddleware.get(dir);
    if (middleware) {
      chain.push(middleware);
    }
  }
  const commandKey = `${command.directory}\0${command.data.name}`;
  const commandMiddleware = registry.commandMiddleware.get(commandKey);
  if (commandMiddleware) {
    chain.push(commandMiddleware);
  }
  return chain;
}
