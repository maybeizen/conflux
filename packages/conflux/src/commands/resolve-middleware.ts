import { dirname } from "node:path";

import type { CommandMiddleware, LoadedCommand } from "./types.js";

export type MiddlewareMaps = {
  globalMiddleware: CommandMiddleware | null;
  directoryMiddleware: Map<string, CommandMiddleware>;
  commandMiddleware: Map<string, CommandMiddleware>;
};

function directoryChain(commandsDir: string, commandDir: string): string[] {
  const dirs: string[] = [];
  let current = commandDir;
  while (true) {
    dirs.unshift(current);
    if (current === commandsDir) {
      break;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(`Command directory ${commandDir} is not inside ${commandsDir}`);
    }
    current = parent;
  }
  return dirs;
}

export function resolveMiddlewareChain(
  maps: MiddlewareMaps,
  command: LoadedCommand,
  commandsDir: string,
): CommandMiddleware[] {
  const chain: CommandMiddleware[] = [];
  if (maps.globalMiddleware) {
    chain.push(maps.globalMiddleware);
  }
  for (const dir of directoryChain(commandsDir, command.directory)) {
    const middleware = maps.directoryMiddleware.get(dir);
    if (middleware) {
      chain.push(middleware);
    }
  }
  const commandKey = `${command.directory}\0${command.data.name}`;
  const commandMiddleware = maps.commandMiddleware.get(commandKey);
  if (commandMiddleware) {
    chain.push(commandMiddleware);
  }
  return chain;
}
