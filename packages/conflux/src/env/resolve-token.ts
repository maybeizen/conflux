import type { ResolvedConfluxConfig } from "../config/types.js";

export const TOKEN_ENV_CANDIDATES = [
  "FLUXER_BOT_TOKEN",
  "CONFLUX_BOT_TOKEN",
  "BOT_TOKEN",
] as const;

export function resolveBotToken(config: ResolvedConfluxConfig): string {
  if (config.token) {
    return config.token;
  }
  if (config.env) {
    const fromNamed = process.env[config.env];
    if (fromNamed) {
      return fromNamed;
    }
    throw new Error(
      `Bot token env var "${config.env}" is not set (check .env or your environment)`,
    );
  }
  for (const name of TOKEN_ENV_CANDIDATES) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }
  throw new Error(
    `No bot token found. Set one of ${TOKEN_ENV_CANDIDATES.join(", ")} in .env or use token/env in conflux.config`,
  );
}
