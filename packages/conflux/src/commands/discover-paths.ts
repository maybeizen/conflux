import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { isLoadableModule } from "../loader/directory-modules.js";

export type DiscoveredCommandPaths = {
  commandPaths: string[];
  globalMiddlewarePaths: string[];
  directoryMiddlewarePaths: Map<string, string>;
  commandMiddlewarePaths: Map<string, string>;
};

function stem(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? name : name.slice(0, dot);
}

function classifyPlusFile(filePath: string, fileName: string, out: DiscoveredCommandPaths): void {
  const base = stem(fileName);
  if (base === "+global-middleware") {
    out.globalMiddlewarePaths.push(filePath);
    return;
  }
  if (base === "+middleware") {
    out.directoryMiddlewarePaths.set(dirname(filePath), filePath);
    return;
  }
  if (base.startsWith("+") && base.endsWith(".middleware")) {
    const commandName = base.slice(1, -".middleware".length);
    if (!commandName) {
      throw new Error(`Invalid command middleware file name: ${filePath}`);
    }
    const key = `${dirname(filePath)}\0${commandName}`;
    out.commandMiddlewarePaths.set(key, filePath);
    return;
  }
  throw new Error(`Unrecognized middleware file: ${filePath}`);
}

function walkDirectory(dir: string, out: DiscoveredCommandPaths): void {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(entryPath, out);
      continue;
    }
    if (!entry.isFile() || !isLoadableModule(entry.name)) {
      continue;
    }
    if (entry.name.startsWith("+")) {
      classifyPlusFile(entryPath, entry.name, out);
      continue;
    }
    out.commandPaths.push(entryPath);
  }
}

export function discoverCommandPaths(commandsDir: string): DiscoveredCommandPaths {
  const out: DiscoveredCommandPaths = {
    commandPaths: [],
    globalMiddlewarePaths: [],
    directoryMiddlewarePaths: new Map(),
    commandMiddlewarePaths: new Map(),
  };
  if (!existsSync(commandsDir)) {
    return out;
  }
  walkDirectory(commandsDir, out);
  out.commandPaths.sort((a, b) => a.localeCompare(b));
  return out;
}
