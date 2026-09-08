import type { Options } from "tsdown";

export type ConfluxTsdownOptions = Omit<
  Options,
  "config" | "configLoader" | "cwd" | "entry" | "filter" | "outDir" | "watch"
>;

export type ConfluxUserConfig = {
  root?: string;
  outDir?: string;
  entry?: string;
  commandsDir?: string;
  eventsDir?: string;
  token?: string;
  env?: string;
  prefix?: string | string[];
  tsdown?: ConfluxTsdownOptions;
};

export type ResolvedConfluxConfig = {
  root: string;
  outDir: string;
  entry: string;
  commandsDir: string;
  eventsDir: string;
  token?: string;
  env?: string;
  prefix: string[];
  tsdown?: ConfluxTsdownOptions;
};

export type ConfluxOptions = {
  root?: string;
};
