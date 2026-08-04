import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const toPosix = (p: string) => p.split("\\").join("/");
const entry = toPosix(join(root, "packages/conflux/src/entries/index.ts"));
const tsconfig = toPosix(join(root, "packages/conflux/tsconfig.json"));
const websiteRoot = join(root, "apps/website");
const outDir = join(websiteRoot, "api");
const groupedSidebarPath = join(websiteRoot, ".vitepress/data/api-sidebar-grouped.json");

type SidebarEntry = { title: string; href: string };

function titleFromBaseName(base: string): string {
  if (base.toLowerCase() === "readme" || base.toLowerCase() === "index") {
    return "API Reference";
  }
  return base
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function routeFromFile(filePath: string): string {
  const rel = relative(websiteRoot, filePath).replace(/\\/g, "/").replace(/\.md$/i, "");
  const lower = rel.toLowerCase();
  if (lower === "api/readme" || lower === "api/index") return "/api/";
  return `/${lower}`;
}

function withTitleFrontmatter(body: string, title: string): string {
  const block = `---\ntitle: ${JSON.stringify(title)}\n---\n\n`;
  if (body.startsWith("---")) {
    return body.replace(/^---\n[\s\S]*?\n---\n/, block);
  }
  return `${block}${body}`;
}

function lowercaseLinkTarget(url: string): string {
  if (/^(https?:|mailto:|#)/.test(url)) return url;
  return url
    .split("/")
    .map((part) => {
      if (part === ".." || part === "." || part === "") return part;
      const dot = part.lastIndexOf(".");
      if (dot === -1) return part.toLowerCase();
      return `${part.slice(0, dot).toLowerCase()}${part.slice(dot).toLowerCase()}`;
    })
    .join("/");
}

function rewriteApiMarkdownLinks(body: string): string {
  return body.replace(/\]\(([^)]+)\)/g, (full, url: string) => {
    const trimmed = url.trim();
    return `](${lowercaseLinkTarget(trimmed)})`;
  });
}

function collectMarkdownFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      collectMarkdownFiles(full, acc);
      continue;
    }
    if (name.endsWith(".md")) acc.push(full);
  }
  return acc;
}

function apiGroupFromHref(href: string): string {
  if (href === "/api/" || href === "/api/index") return "overview";
  if (href.startsWith("/api/classes/")) return "classes";
  if (href.startsWith("/api/functions/")) return "functions";
  return "types";
}

function buildGroupedSidebar(sidebar: SidebarEntry[]): {
  groups: { id: string; title: string; items: SidebarEntry[] }[];
} {
  const titles: Record<string, string> = {
    overview: "Overview",
    classes: "Classes",
    functions: "Functions",
    types: "Type aliases",
  };
  const buckets = new Map<string, SidebarEntry[]>();
  for (const item of sidebar) {
    const group = apiGroupFromHref(item.href);
    const list = buckets.get(group) ?? [];
    list.push(item);
    buckets.set(group, list);
  }
  for (const list of buckets.values()) {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }
  const order = ["overview", "classes", "functions", "types"];
  return {
    groups: order.map((id) => ({
      id,
      title: titles[id] ?? id,
      items: buckets.get(id) ?? [],
    })),
  };
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const run = spawnSync(
  "pnpm",
  [
    "x",
    "typedoc",
    "--entryPoints",
    entry,
    "--tsconfig",
    tsconfig,
    "--plugin",
    "typedoc-plugin-markdown",
    "--out",
    outDir,
    "--readme",
    "none",
    "--excludePrivate",
    "--excludeInternal",
    "--hidePageHeader",
    "--hideBreadcrumbs",
  ],
  { cwd: root, stdio: "inherit" },
);

if (run.status !== 0) {
  process.exit(run.status ?? 1);
}

const readmePath = join(outDir, "README.md");
const indexPath = join(outDir, "index.md");
if (existsSync(readmePath)) {
  renameSync(readmePath, indexPath);
}

function normalizeApiFileNames(dir: string): void {
  for (const filePath of collectMarkdownFiles(dir)) {
    const lowerName = basename(filePath).toLowerCase();
    const target = join(dirname(filePath), lowerName);
    if (target !== filePath) {
      renameSync(filePath, target);
    }
  }
}

normalizeApiFileNames(outDir);

const sidebar: SidebarEntry[] = [];

for (const filePath of collectMarkdownFiles(outDir)) {
  const title = titleFromBaseName(basename(filePath, ".md"));
  const href = routeFromFile(filePath);
  const body = readFileSync(filePath, "utf8");
  writeFileSync(filePath, withTitleFrontmatter(rewriteApiMarkdownLinks(body), title));
  sidebar.push({ title, href });
}

sidebar.sort((a, b) => a.title.localeCompare(b.title));
mkdirSync(dirname(groupedSidebarPath), { recursive: true });
writeFileSync(groupedSidebarPath, `${JSON.stringify(buildGroupedSidebar(sidebar), null, 2)}\n`);

console.log(`Wrote ${sidebar.length} API pages to ${relative(root, outDir)}`);
