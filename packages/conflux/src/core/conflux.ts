import type { Client } from "@fluxerjs/core";

import type { ConfluxOptions } from "../config/types.js";

export type PrefixResolver = () => string | string[] | Promise<string | string[]>;

export type ConfluxConfigure = (conflux: Conflux) => void | Promise<void>;

export class Conflux {
  readonly options: ConfluxOptions;
  client: Client | null = null;
  private prefixResolver: PrefixResolver | null = null;

  constructor(options: ConfluxOptions = {}) {
    this.options = options;
  }

  setPrefix(resolver: PrefixResolver): void {
    this.prefixResolver = resolver;
  }

  async resolvePrefixes(): Promise<string[]> {
    if (!this.prefixResolver) {
      return ["!"];
    }
    const result = await this.prefixResolver();
    return Array.isArray(result) ? result : [result];
  }
}

export function createConflux(options?: ConfluxOptions): Conflux {
  return new Conflux(options ?? {});
}
