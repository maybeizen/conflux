import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function getDefaultTemplateRoot(): string {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(moduleDir, "../templates/default"),
    join(moduleDir, "../../templates/default"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Conflux template directory not found. Looked for:\n${candidates.map((c) => `  - ${c}`).join("\n")}`,
  );
}
