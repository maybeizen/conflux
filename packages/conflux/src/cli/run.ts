import { resolve } from "node:path";

import { runBuildCommand } from "./build-cmd.js";
import { runDevCommand } from "./dev-cmd.js";
import { getPackageVersion } from "./package-version.js";
import { CLI_USAGE, parseArgs } from "./parse-args.js";
import { runStartCommand } from "./start-cmd.js";

async function main(): Promise<void> {
  const { command, root, help, version } = parseArgs(process.argv.slice(2));
  if (help) {
    console.log(CLI_USAGE);
    return;
  }
  if (version) {
    console.log(getPackageVersion());
    return;
  }
  const projectRoot = root ? resolve(root) : undefined;
  switch (command) {
    case "build":
      await runBuildCommand(projectRoot);
      return;
    case "start":
      await runStartCommand(projectRoot);
      return;
    case "dev":
    case "run":
    case null:
      runDevCommand(projectRoot);
      return;
    default:
      console.error(`Unknown command: ${command}`);
      console.error(CLI_USAGE);
      process.exit(1);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
