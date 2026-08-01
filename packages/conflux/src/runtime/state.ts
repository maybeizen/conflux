import type { ResolvedConfluxConfig } from "../config/types.js";

type RuntimeState = {
  config: ResolvedConfluxConfig | null;
};

const state: RuntimeState = {
  config: null,
};

export function setConfig(config: ResolvedConfluxConfig): void {
  state.config = config;
}

export function getConfig(): ResolvedConfluxConfig {
  if (!state.config) {
    throw new Error("Conflux runtime is not initialized. Run `conflux run` first.");
  }
  return state.config;
}
