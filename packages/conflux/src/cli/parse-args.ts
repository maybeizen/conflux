export type ParsedCliArgs = {
  command: string | null;
  root: string | null;
};

export function parseArgs(argv: string[]): ParsedCliArgs {
  let command: string | null = null;
  let root: string | null = null;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root" && argv[i + 1]) {
      root = argv[i + 1] ?? null;
      i += 1;
      continue;
    }
    if (!arg.startsWith("-") && !command) {
      command = arg;
    }
  }
  return { command, root };
}

export const CLI_USAGE = `Usage: conflux <command> [--root <dir>]

Commands:
  dev     Watch and run the bot in development
  build   Production build to outDir
  start   Run the bot in production
  run     Alias for dev`;
