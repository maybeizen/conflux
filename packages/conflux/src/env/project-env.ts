import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { isValidEnvKey } from "./env-key.js";

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  const exportPrefix = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
  const eq = exportPrefix.indexOf("=");
  if (eq === -1) {
    return null;
  }
  const key = exportPrefix.slice(0, eq).trim();
  if (!isValidEnvKey(key)) {
    return null;
  }
  let value = exportPrefix.slice(eq + 1).trim();
  const quote = value.startsWith('"') ? '"' : value.startsWith("'") ? "'" : null;
  if (quote) {
    if (value.length >= 2 && value.endsWith(quote)) {
      value = value.slice(1, -1);
    }
  } else {
    const comment = value.search(/\s+#/);
    if (comment !== -1) {
      value = value.slice(0, comment).trimEnd();
    }
  }
  return [key, value];
}

function loadEnvFile(path: string, lockedKeys: ReadonlySet<string>): void {
  if (!existsSync(path)) {
    return;
  }
  const content = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  for (const line of content.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed) {
      continue;
    }
    const [key, value] = parsed;
    if (lockedKeys.has(key)) {
      continue;
    }
    process.env[key] = value;
  }
}

export function loadProjectEnv(root: string): void {
  const lockedKeys = new Set(Object.keys(process.env));
  loadEnvFile(join(root, ".env"), lockedKeys);
  loadEnvFile(join(root, ".env.local"), lockedKeys);
}
