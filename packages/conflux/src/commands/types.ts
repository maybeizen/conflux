import type { Client, Message, PermissionResolvable } from "@fluxerjs/core";

import type { Conflux } from "../core/conflux.js";

export type CommandMetadata = {
  userPermissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  guilds?: string[];
  aliases?: string[];
};

export type CommandData = { name: string } & CommandMetadata;

export type CommandContext = {
  message: Message;
  client: Client;
  conflux: Conflux;
  args: () => string[];
  data: CommandData;
  commandName: string;
};

export type MessageCommandAfter = (ctx: CommandContext) => void | Promise<void>;

export type MessageCommand = ((ctx: CommandContext) => void | Promise<void>) & {
  after?: MessageCommandAfter;
};

export type CommandMiddleware = {
  beforeExecute(ctx: CommandContext): void | Promise<void>;
  afterExecute(ctx: CommandContext): void | Promise<void>;
};

export type LoadedCommand = {
  filePath: string;
  directory: string;
  data: CommandData;
  message: MessageCommand;
  after?: MessageCommandAfter;
};

export type CommandRegistry = {
  commands: LoadedCommand[];
  byTrigger: Map<string, LoadedCommand>;
  globalMiddleware: CommandMiddleware | null;
  directoryMiddleware: Map<string, CommandMiddleware>;
  commandMiddleware: Map<string, CommandMiddleware>;
};
