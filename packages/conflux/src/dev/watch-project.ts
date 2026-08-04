import { type ChildProcess, spawn } from "node:child_process";
import { watch } from "node:fs";
import { dirname } from "node:path";

import { buildBotProject, BuildFailedError } from "../build/build-bot.js";
import { resolveBuiltConfig } from "../build/resolve-built-config.js";
import { findConfigPath, loadConfluxConfig } from "../config/load-config.js";
import { ensureDevBootstrap } from "./dev-bootstrap.js";
import { resolveDevOutDir } from "./dev-out-dir.js";

const RESTART_DEBOUNCE_MS = 250;

function watchDirectory(
  path: string,
  onChange: () => void,
  watchers: ReturnType<typeof watch>[],
): void {
  try {
    watchers.push(
      watch(path, { recursive: true }, (_eventType, filename) => {
        if (filename === null) {
          return;
        }
        onChange();
      }),
    );
  } catch {
    return;
  }
}

function watchFile(path: string, onChange: () => void, watchers: ReturnType<typeof watch>[]): void {
  try {
    watchers.push(watch(path, () => onChange()));
  } catch {
    return;
  }
}

export async function runProjectDevWatch(root?: string): Promise<void> {
  const projectRoot = root ?? process.cwd();
  const devOutDir = resolveDevOutDir(projectRoot);
  const bunExecutable = process.env.CONFLUX_BUN ?? "pnpm";
  const watchers: ReturnType<typeof watch>[] = [];
  let child: ChildProcess | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let shuttingDown = false;
  let building = false;
  let rebuildQueued = false;

  const stopChild = (): void => {
    if (!child || child.killed) {
      return;
    }
    child.kill("SIGTERM");
    child = null;
  };

  const startChild = (entryPath: string): void => {
    stopChild();
    child = spawn(bunExecutable, [entryPath], {
      cwd: projectRoot,
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "development" },
    });
    child.on("exit", (code, signal) => {
      if (shuttingDown) {
        return;
      }
      if (signal === "SIGTERM") {
        return;
      }
      if (code !== 0 && code !== null) {
        process.exitCode = code;
      }
    });
  };

  const rebuildAndRestart = async (): Promise<void> => {
    if (building) {
      rebuildQueued = true;
      return;
    }
    building = true;
    try {
      await buildBotProject({
        root: projectRoot,
        outDir: devOutDir,
        minify: false,
      });
      const config = await loadConfluxConfig(projectRoot);
      const built = resolveBuiltConfig({ ...config, outDir: devOutDir });
      if (!built) {
        throw new Error(`Dev build missing entry in ${devOutDir}`);
      }
      const runnerPath = ensureDevBootstrap(projectRoot, built);
      startChild(runnerPath);
    } catch (error: unknown) {
      if (error instanceof BuildFailedError) {
        console.error(
          `\n[conflux dev] Build failed (exit ${error.exitCode}). Fix the error above and save to retry.`,
        );
      } else {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\n[conflux dev] ${message}`);
      }
    } finally {
      building = false;
      if (rebuildQueued) {
        rebuildQueued = false;
        await rebuildAndRestart();
      }
    }
  };

  const scheduleRestart = (): void => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void rebuildAndRestart();
    }, RESTART_DEBOUNCE_MS);
  };

  const config = await loadConfluxConfig(projectRoot);
  const watchTargets = new Set<string>([
    dirname(config.entry),
    config.eventsDir,
    config.commandsDir,
  ]);
  const configPath = findConfigPath(projectRoot);
  if (configPath) {
    watchFile(configPath, scheduleRestart, watchers);
  }
  for (const target of watchTargets) {
    watchDirectory(target, scheduleRestart, watchers);
  }

  const shutdown = (): void => {
    shuttingDown = true;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    for (const watcher of watchers) {
      watcher.close();
    }
    stopChild();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await rebuildAndRestart();
}
