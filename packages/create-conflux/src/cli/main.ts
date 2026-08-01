import { runCreateConflux } from "../lib/create-project.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log("Usage: create-conflux [project-name]");
  process.exit(0);
}

const positional = args.find((arg: string) => !arg.startsWith("-"));
runCreateConflux(positional ? { name: positional } : {}).then((code) => {
  process.exit(code);
});
