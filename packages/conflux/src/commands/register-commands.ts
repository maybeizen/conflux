import type { Client } from "@fluxerjs/core";

import type { Conflux } from "../core/conflux.js";
import { dispatchPrefixCommand } from "./dispatch.js";
import type { CommandRegistry } from "./types.js";

export function registerConfluxCommands(
  client: Client,
  conflux: Conflux,
  registry: CommandRegistry,
  commandsDir: string,
): void {
  client.on("messageCreate", (message) => {
    void dispatchPrefixCommand(message, client, conflux, registry, commandsDir).catch(
      (error: unknown) => {
        void conflux.reportError(error, { scope: "command" });
      },
    );
  });
}
