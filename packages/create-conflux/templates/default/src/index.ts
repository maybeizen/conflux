import type { Conflux } from "@confluxjs/conflux";
import { Client } from "@fluxerjs/core";

const client = new Client({ intents: 0 });

export async function configure(conflux: Conflux) {
  conflux.setPrefix(async () => ["!"]);
}

export { client };
