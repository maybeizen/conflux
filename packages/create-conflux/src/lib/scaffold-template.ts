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
  const pkg = JSON.parse(raw) as { name: string };
  pkg.name = packageName;
  await writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}
