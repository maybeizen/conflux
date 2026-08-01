import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

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
  let value = exportPrefix.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return [key, value];
}

function loadEnvFile(path: string): void {
  if (!existsSync(path)) {
    return;
  }
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed) {
      continue;
    }
    const [key, value] = parsed;
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function loadProjectEnv(root: string): void {
  loadEnvFile(join(root, ".env"));
  loadEnvFile(join(root, ".env.local"));
}
