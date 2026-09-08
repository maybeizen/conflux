import { defineConfig } from "tsdown";

const isDev = process.argv.includes("--watch");

export default defineConfig({
  format: ["esm", "cjs"],
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
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
    if (/(?:^|[\\/])cli\.(?:cjs|js|mjs)$/.test(fileName)) {
      return "#!/usr/bin/env node";
    }
  },
});
