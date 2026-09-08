import { dirname, relative } from "node:path";
import { build } from "tsdown";

import { loadCommandRegistry } from "../commands/load-registry.js";
import { loadConfluxConfig } from "../config/load-config.js";
import { collectCommandTreeModulePaths } from "../loader/command-paths.js";
import { collectEventDirectoryModulePaths } from "../loader/directory-modules.js";
import { mergeTsdownOptions } from "./merge-tsdown-options.js";

const SOURCE_EXT = /\.(tsx?|mts|cts)$/i;

export type BuildBotOptions = {
  root?: string;
  outDir?: string;
  minify?: boolean;
};

export class BuildFailedError extends Error {
  readonly exitCode: number;

  constructor(exitCode: number, cause?: unknown) {
    super(`tsdown build failed with exit code ${exitCode}`);
    this.name = "BuildFailedError";
    this.exitCode = exitCode;
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

function toEntryName(entryFile: string, sourcePath: string): string {
  return relative(dirname(entryFile), sourcePath)
    .replaceAll("\\", "/")
    .replace(SOURCE_EXT, "");
}

export async function buildBotProject(options: BuildBotOptions = {}): Promise<void> {
  const projectRoot = options.root ?? process.cwd();
  const config = await loadConfluxConfig(projectRoot);
  if (!config.entry) {
    throw new Error("Conflux entry is not configured");
  }
  await loadCommandRegistry(config.commandsDir);
  const entrypoints = [
    config.entry,
    ...collectEventDirectoryModulePaths(config.eventsDir),
    ...collectCommandTreeModulePaths(config.commandsDir),
  ];
  const entry: Record<string, string> = {};
  for (const path of entrypoints) {
    entry[toEntryName(config.entry, path)] = path;
  }
  try {
    await build(
      mergeTsdownOptions(
        {
          format: "esm",
          platform: "node",
          dts: false,
          exports: false,
          sourcemap: options.minify === false,
          minify: options.minify !== false,
          clean: true,
          hash: false,
          fixedExtension: false,
        },
        config.tsdown,
        {
          config: false,
          cwd: config.root,
          entry,
          outDir: options.outDir ?? config.outDir,
        },
      ),
    );
  } catch (error: unknown) {
    throw new BuildFailedError(1, error);
  }
}
