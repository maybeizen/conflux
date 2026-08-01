import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const testBot = join(root, "apps/test-bot");
const logPath = join(root, "debug-e03785.log");

function log(message, data, hypothesisId) {
  appendFileSync(
    logPath,
    `${JSON.stringify({
      sessionId: "e03785",
      runId: process.env.DEBUG_RUN_ID ?? "pre-fix",
      hypothesisId,
      location: "scripts/debug-test-bot-bin.mjs",
      message,
      data,
      timestamp: Date.now(),
    })}\n`,
  );
}

const bins = [
  join(testBot, "node_modules/.bin/conflux"),
  join(testBot, "node_modules/.bin/conflux.cmd"),
  join(root, "node_modules/.bin/conflux"),
  join(testBot, "node_modules/@confluxjs/conflux/dist/cli.cjs"),
];

log(
  "bin paths",
  Object.fromEntries(bins.map((p) => [p.replace(root, ""), existsSync(p)])),
  "H1-H2",
);

const which = spawnSync("bun", ["--version"], { encoding: "utf8", cwd: testBot });
log("bun version", { stdout: which.stdout?.trim(), status: which.status }, "H2");

const build = spawnSync("bun", ["run", "build"], {
  encoding: "utf8",
  cwd: testBot,
});
log(
  "bun run build after fix",
  {
    status: build.status,
    stdoutTail: (build.stdout || "").slice(-400),
    stderrTail: (build.stderr || "").slice(-400),
  },
  "H2",
);

process.exit(0);
