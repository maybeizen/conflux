import pc from "picocolors";

import { runCreateConflux } from "../lib/create-project.js";

export function runCli(): void {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Usage: create-conflux [dir-or-name]

Scaffold a new Conflux bot project interactively.

Arguments:
  dir-or-name   Optional default for the project directory (e.g. ./my-bot)

You will be prompted for:
  - Project directory (created under the current working directory)
  - Package name (only if the folder name is not a valid npm package name)
  - Fluxer bot token (optional; writes .env when provided)
  - Git initialization (default: yes)
  - Dependency install with detected package manager (default: yes)

Environment:
  Package manager is detected from npm user-agent, lockfiles in cwd, then PATH.

Examples:
  ${pc.cyan("pnpm create @confluxjs/create-conflux")}
  ${pc.cyan("pnpm create @confluxjs/create-conflux my-bot")}
  ${pc.cyan("npm create @confluxjs/create-conflux@latest")}
`);
    process.exit(0);
  }

  const positional = args.find((arg: string) => !arg.startsWith("-"));

  runCreateConflux(positional ? { name: positional } : {})
    .then((code) => {
      process.exit(code);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exit(1);
    });
}
