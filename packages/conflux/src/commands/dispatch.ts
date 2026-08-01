import type { Client, Message } from "@fluxerjs/core";
import { parsePrefixCommand } from "@fluxerjs/core";

import type { Conflux } from "../core/conflux.js";
import { checkCommandPermissions } from "./check-permissions.js";
import { resolveMiddlewareChain } from "./resolve-middleware.js";
import type { CommandContext, CommandRegistry } from "./types.js";

function parseWithPrefixes(
  content: string,
  prefixes: string[],
): { command: string; args: string[] } | null {
  for (const prefix of prefixes) {
    const parsed = parsePrefixCommand(content, prefix);
    if (parsed) {
      return parsed;
    }
  }
  return null;
}

function passesGuildFilter(message: Message, guilds: string[] | undefined): boolean {
  if (!guilds?.length) {
    return true;
  }
  if (!message.guildId) {
    return true;
  }
  return guilds.includes(message.guildId);
}

function createCommandContext(
  message: Message,
  client: Client,
  conflux: Conflux,
  commandName: string,
  args: string[],
  data: CommandContext["data"],
): CommandContext {
  return {
    message,
    client,
    conflux,
    data,
    commandName,
    args: () => args,
  };
}

export async function dispatchPrefixCommand(
  message: Message,
  client: Client,
  conflux: Conflux,
  registry: CommandRegistry,
  commandsDir: string,
): Promise<void> {
  if (message.author.bot) {
    return;
  }
  const prefixes = await conflux.resolvePrefixes();
  const parsed = parseWithPrefixes(message.content, prefixes);
  if (!parsed) {
    return;
  }
  const command = registry.byTrigger.get(parsed.command.toLowerCase());
  if (!command) {
    return;
  }
  if (!passesGuildFilter(message, command.data.guilds)) {
    return;
  }
  const allowed = await checkCommandPermissions(
    message,
    command.data.userPermissions,
    command.data.botPermissions,
  );
  if (!allowed) {
    return;
  }
  const ctx = createCommandContext(
    message,
    client,
    conflux,
    parsed.command,
    parsed.args,
    command.data,
  );
  const middlewares = resolveMiddlewareChain(registry, command, commandsDir);
  for (const middleware of middlewares) {
    await middleware.beforeExecute(ctx);
  }
  await command.message(ctx);
  if (command.after) {
    await command.after(ctx);
  }
  for (let i = middlewares.length - 1; i >= 0; i -= 1) {
    await middlewares[i]!.afterExecute(ctx);
  }
}
