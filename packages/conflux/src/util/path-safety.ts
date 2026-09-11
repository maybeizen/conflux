import { isAbsolute, relative, resolve, sep } from "node:path";

export function isPathInsideRoot(root: string, target: string): boolean {
  const resolvedRoot = resolve(root);
  const resolvedTarget = resolve(target);
  const rel = relative(resolvedRoot, resolvedTarget);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel));
}

export function assertPathInsideRoot(root: string, target: string, label: string): void {
  if (!isPathInsideRoot(root, target)) {
    throw new Error(`Conflux ${label} must stay inside project root (${root}): ${target}`);
  }
}
