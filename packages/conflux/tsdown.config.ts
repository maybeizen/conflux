import { defineConfig } from "tsdown";

const isDev = process.argv.includes("--watch");

export default defineConfig({
  format: ["esm", "cjs"],
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
  outDir: "./dist",
  sourcemap: isDev,
  watch: false,
  minify: !isDev,
  dts: true,
  shims: false,
  skipNodeModulesBundle: true,
  clean: true,
  platform: "node",
  target: "node20",
  exports: false,
  outputOptions: {
    exports: "named",
  },
  fixedExtension: false,
  outExtensions: (context) => ({
    dts: ".d.ts",
    js: context.format === "es" ? ".js" : ".cjs",
  }),
  unbundle: false,
  banner: ({ fileName }) => {
    if (/(?:^|[\\/])(?:cli|start|dev-runner)\.(?:cjs|js|mjs)$/.test(fileName)) {
      return "#!/usr/bin/env node";
    }
  },
});
