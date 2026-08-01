import { parseArgs } from "../cli/parse-args.js";
import { runConflux } from "../runtime/run-conflux.js";

const { root } = parseArgs(process.argv.slice(2));

runConflux({ root: root ?? undefined }).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
