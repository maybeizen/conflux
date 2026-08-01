import { defineConfig } from "tsdown";

const shared = {
  format: ["esm", "cjs"] as const,
  platform: "node" as const,
  dts: { cjsReexport: true },
  sourcemap: true,
};

export default defineConfig([
  {
    ...shared,
    entry: {
      index: "src/entries/index.ts",
      config: "src/entries/config.ts",
      runtime: "src/entries/runtime.ts",
      events: "src/entries/events.ts",
      commands: "src/entries/commands.ts",
    },
    exports: false,
    clean: true,
  },
  {
    ...shared,
    entry: {
      cli: "src/cli/run.ts",
      start: "src/cli/start.ts",
      "dev-runner": "src/entries/dev-runner.ts",
    },
    clean: false,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
