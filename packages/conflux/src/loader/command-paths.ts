import { discoverCommandPaths } from "../commands/discover-paths.js";

export function collectCommandTreeModulePaths(commandsDir: string): string[] {
  const discovered = discoverCommandPaths(commandsDir);
  const paths = [
    ...discovered.commandPaths,
    ...discovered.globalMiddlewarePaths,
    ...discovered.directoryMiddlewarePaths.values(),
    ...discovered.commandMiddlewarePaths.values(),
  ];
  return [...new Set(paths)].sort((a, b) => a.localeCompare(b));
}
