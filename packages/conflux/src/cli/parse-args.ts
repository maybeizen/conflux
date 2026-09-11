export type ParsedCliArgs = {
  command: string | null;
  root: string | null;
  help: boolean;
  version: boolean;
};

export function parseArgs(argv: string[]): ParsedCliArgs {
  let command: string | null = null;
  let root: string | null = null;
  let help = false;
  let version = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (arg === "--version" || arg === "-v") {
      version = true;
      continue;
    }
    if (arg === "--root") {
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        throw new Error("Missing value for --root");
      }
      root = next;
      i += 1;
      continue;
    }
    if (!arg.startsWith("-") && !command) {
      command = arg;
    }
  }
  return { command, root, help, version };
}

export const CLI_USAGE = `Usage: conflux <command> [--root <dir>]

Commands:
  dev     Watch and run the bot in development
  build   Production build to outDir
  start   Run the bot in production
  run     Alias for dev

Options:
  --root <dir>  Project directory (default: current working directory)
  -h, --help    Show this help
  -v, --version Show package version`;
