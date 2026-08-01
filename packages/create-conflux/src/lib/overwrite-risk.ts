import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

async function walkFiles(root: string, dir: string, out: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(root, full, out);
      continue;
    }
    if (entry.isFile()) {
      out.push(relative(root, full).split("\\").join("/"));
    }
  }
}

export async function listTemplateRelativeFiles(templateRoot: string): Promise<string[]> {
  const files: string[] = [];
  await walkFiles(templateRoot, templateRoot, files);
  return files.filter((file) => file !== ".env");
}

export type OverwriteRisk = {
  targetExists: boolean;
  isNonEmpty: boolean;
  conflictingPaths: string[];
  willOverwriteEnv: boolean;
};

export async function assessOverwriteRisk(
  targetDir: string,
  templateRoot: string,
  options: { writeEnv: boolean },
): Promise<OverwriteRisk> {
  let targetExists = false;
  let isNonEmpty = false;
  const conflictingPaths: string[] = [];

  try {
    const targetStat = await stat(targetDir);
    targetExists = true;
    isNonEmpty = !(await directoryIsEmpty(targetDir));
    if (targetStat.isDirectory()) {
      const templateFiles = await listTemplateRelativeFiles(templateRoot);
      for (const relPath of templateFiles) {
        try {
          await stat(join(targetDir, relPath));
          conflictingPaths.push(relPath);
        } catch {
          // path does not exist at target
        }
      }
    }
  } catch {
    targetExists = false;
  }

  let willOverwriteEnv = false;
  if (options.writeEnv && targetExists) {
    try {
      await stat(join(targetDir, ".env"));
      willOverwriteEnv = true;
    } catch {
      // no .env
    }
  }

  return {
    targetExists,
    isNonEmpty,
    conflictingPaths,
    willOverwriteEnv,
  };
}

async function directoryIsEmpty(dir: string): Promise<boolean> {
  const entries = await readdir(dir);
  return entries.length === 0;
}

export function requiresOverwriteConfirmation(risk: OverwriteRisk): boolean {
  return (
    risk.isNonEmpty ||
    risk.conflictingPaths.length > 0 ||
    risk.willOverwriteEnv
  );
}

const MANUAL_INSTALL_URL = "https://conflux.js.org/guides/manual-installation";

export function manualInstallationHint(): string {
  return `Quit and set up the project manually instead:\n  ${MANUAL_INSTALL_URL}`;
}

export function formatConflictSummary(risk: OverwriteRisk, targetDir: string): string {
  const lines: string[] = [];
  if (risk.isNonEmpty) {
    lines.push(`${targetDir} is not empty.`);
  }
  if (risk.conflictingPaths.length > 0) {
    const shown = risk.conflictingPaths.slice(0, 12);
    const extra =
      risk.conflictingPaths.length > shown.length
        ? `\n  …and ${risk.conflictingPaths.length - shown.length} more`
        : "";
    lines.push(
      `These paths would be overwritten:\n${shown.map((p) => `  · ${p}`).join("\n")}${extra}`,
    );
  }
  if (risk.willOverwriteEnv) {
    lines.push("An existing .env file would be replaced with your bot token.");
  }
  if (risk.isNonEmpty && risk.conflictingPaths.length === 0 && !risk.willOverwriteEnv) {
    lines.push("Scaffolding will add Conflux files alongside your existing files.");
  }
  return lines.join("\n\n");
}

export { MANUAL_INSTALL_URL };
