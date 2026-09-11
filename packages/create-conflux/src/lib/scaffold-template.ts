import { cp, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

import { getDefaultTemplateRoot } from "./paths.js";

export async function scaffoldTemplate(targetDir: string, packageName: string): Promise<void> {
  const templateRoot = getDefaultTemplateRoot();
  await cp(templateRoot, targetDir, {
    recursive: true,
    filter(src) {
      return basename(src) !== ".env";
    },
  });
  const packageJsonPath = join(targetDir, "package.json");
  const raw = await readFile(packageJsonPath, "utf8");
  let pkg: { name?: unknown } & Record<string, unknown>;
  try {
    pkg = JSON.parse(raw) as { name?: unknown } & Record<string, unknown>;
  } catch {
    throw new Error(`Invalid package.json in template: ${packageJsonPath}`);
  }
  if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) {
    throw new Error(`Invalid package.json in template: ${packageJsonPath}`);
  }
  pkg.name = packageName;
  await writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}
