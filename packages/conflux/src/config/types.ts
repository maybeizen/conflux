export type ConfluxUserConfig = {
  root?: string;
  outDir?: string;
  entry?: string;
  commandsDir?: string;
  eventsDir?: string;
  token?: string;
  env?: string;
};

export type ResolvedConfluxConfig = {
  root: string;
  outDir: string;
  entry: string;
  commandsDir: string;
  eventsDir: string;
  token?: string;
  env?: string;
};

export type ConfluxOptions = {
  root?: string;
};
