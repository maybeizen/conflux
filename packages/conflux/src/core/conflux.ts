import type { Client } from "@fluxerjs/core";

import type { ConfluxOptions } from "../config/types.js";
import type { ConfluxErrorContext, ConfluxErrorHandler } from "../runtime/handle-error.js";
import {
  defaultConfluxErrorHandler,
  invokeConfluxErrorHandler,
} from "../runtime/handle-error.js";

export type PrefixResolver = () => string | string[] | Promise<string | string[]>;

export type ConfluxConfigure = (conflux: Conflux) => void | Promise<void>;

export class Conflux {
  readonly options: ConfluxOptions;
  client: Client | null = null;
  private prefixResolver: PrefixResolver | null = null;
  private errorHandler: ConfluxErrorHandler = defaultConfluxErrorHandler;

  constructor(options: ConfluxOptions = {}) {
    this.options = options;
  }

  setPrefix(resolver: PrefixResolver): void {
    this.prefixResolver = resolver;
  }

  setErrorHandler(handler: ConfluxErrorHandler | null): void {
    this.errorHandler = handler ?? defaultConfluxErrorHandler;
  }

  async reportError(error: unknown, context: ConfluxErrorContext): Promise<void> {
    await invokeConfluxErrorHandler(this.errorHandler, error, context);
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
