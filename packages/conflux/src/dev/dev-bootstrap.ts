import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ResolvedConfluxConfig } from "../config/types.js";
import { resolveDevOutDir } from "./dev-out-dir.js";

export function ensureDevBootstrap(projectRoot: string, built: ResolvedConfluxConfig): string {
  const dir = resolveDevOutDir(projectRoot);
  const filePath = join(dir, "dev.mjs");
  mkdirSync(dir, { recursive: true });
  const source = `import { runConflux } from "@confluxjs/conflux";

await runConflux({
  root: ${JSON.stringify(built.root)},
  entry: ${JSON.stringify(built.entry)},
  eventsDir: ${JSON.stringify(built.eventsDir)},
  commandsDir: ${JSON.stringify(built.commandsDir)},
}).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
`;
  if (!existsSync(filePath) || readFileSync(filePath, "utf8") !== source) {
    writeFileSync(filePath, source, "utf8");
  }
  return filePath;
}
