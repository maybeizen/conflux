import { spawnSync } from "node:child_process";
import { relative } from "node:path";

import { loadCommandRegistry } from "../commands/load-registry.js";
import { loadConfluxConfig } from "../config/load-config.js";
import { collectCommandTreeModulePaths } from "../loader/command-paths.js";
import { collectEventDirectoryModulePaths } from "../loader/directory-modules.js";

export type BuildBotOptions = {
  root?: string;
  outDir?: string;
  minify?: boolean;
};

export class BuildFailedError extends Error {
  readonly exitCode: number;

  constructor(exitCode: number) {
    super(`Bun build failed with exit code ${exitCode}`);
    this.name = "BuildFailedError";
    this.exitCode = exitCode;
  }
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
  const outDir = options.outDir ?? config.outDir;
  const relEntrypoints = entrypoints.map((path) => relative(config.root, path));
  const relOutDir = relative(config.root, outDir);
  const args = [
    "build",
    ...relEntrypoints,
    "--outdir",
    relOutDir,
    "--target",
    "node",
    "--packages",
    "bundle",
    "--sourcemap=linked",
  ];
  if (options.minify !== false) {
    args.push("--minify");
  }
  const result = spawnSync("bun", args, {
    cwd: config.root,
    stdio: "inherit",
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new BuildFailedError(result.status ?? 1);
  }
}
