import type { DiscoveredCommandPaths } from "./discover-paths.js";
import type { LoadedCommand } from "./types.js";

export function validateDiscoveredMiddleware(
  discovered: DiscoveredCommandPaths,
  commandsDir: string,
): void {
  if (discovered.globalMiddlewarePaths.length > 1) {
    throw new Error(
      `Only one +global-middleware module is allowed under ${commandsDir}. Found: ${discovered.globalMiddlewarePaths.join(", ")}`,
    );
  }
}

export function validateCommandTriggers(commands: LoadedCommand[]): void {
  const triggerOwners = new Map<string, string>();
  for (const command of commands) {
    const triggers = [command.data.name, ...(command.data.aliases ?? [])];
    for (const trigger of triggers) {
      if (!trigger) {
        throw new Error(`Command at ${command.filePath} has an empty trigger name or alias`);
      }
      const key = trigger.toLowerCase();
      const existing = triggerOwners.get(key);
      if (existing) {
        throw new Error(
          `Duplicate command trigger "${trigger}" in ${command.filePath} (already used by ${existing})`,
        );
      }
      triggerOwners.set(key, command.filePath);
    }
  }
}
