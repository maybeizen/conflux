import { runProjectDevWatch } from "../dev/watch-project.js";

export function runDevCommand(root?: string): void {
  runProjectDevWatch(root).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  });
}
