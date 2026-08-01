import { resolveBuiltConfig } from "../build/resolve-built-config.js";
import { loadConfluxConfig } from "../config/load-config.js";
import { runConflux } from "../runtime/run-conflux.js";

export async function runStartCommand(root?: string): Promise<void> {
  const projectRoot = root ?? process.cwd();
  const config = await loadConfluxConfig(projectRoot);
  const built = resolveBuiltConfig(config);
  if (built) {
    await runConflux({
      root: projectRoot,
      entry: built.entry,
      eventsDir: built.eventsDir,
      commandsDir: built.commandsDir,
      production: true,
    });
    return;
  }
  await runConflux({ root: projectRoot, production: true });
}
