export const SKIP_DIRECTORY_NAMES = new Set(["node_modules", ".git", "dist", ".conflux", ".turbo"]);

export function shouldSkipDirectory(name: string): boolean {
  return name.startsWith(".") || SKIP_DIRECTORY_NAMES.has(name);
}
