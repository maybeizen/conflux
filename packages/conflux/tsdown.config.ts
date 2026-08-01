import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/entries/index.ts",
    config: "src/entries/config.ts",
    runtime: "src/entries/runtime.ts",
    events: "src/entries/events.ts",
    commands: "src/entries/commands.ts",
    cli: "src/cli/run.ts",
    start: "src/cli/start.ts",
    "dev-runner": "src/entries/dev-runner.ts",
  },
  format: ["esm", "cjs"],
  platform: "node",
  dts: { cjsReexport: true },
  exports: true,
  clean: true,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
