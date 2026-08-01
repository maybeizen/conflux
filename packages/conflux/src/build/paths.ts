import { dirname, join, relative } from "node:path";

const SOURCE_MODULE_PATTERN = /\.(tsx?|mts|cts)$/i;

export function sourceModuleToOutputPath(
  outDir: string,
  entry: string,
  sourcePath: string,
): string {
  const entryDir = dirname(entry);
  const rel = relative(entryDir, sourcePath);
  const jsRel = rel.replace(SOURCE_MODULE_PATTERN, ".js");
  return join(outDir, jsRel);
}

export function sourceDirToOutputDir(outDir: string, entry: string, sourceDir: string): string {
  const entryDir = dirname(entry);
  const rel = relative(entryDir, sourceDir);
  return join(outDir, rel);
}
