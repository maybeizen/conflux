import type { Client, Message } from "@fluxerjs/core";
import { parsePrefixCommand } from "@fluxerjs/core";

import type { Conflux } from "../core/conflux.js";
import { checkCommandPermissions } from "./check-permissions.js";
import { resolveMiddlewareChain } from "./resolve-middleware.js";
import type { CommandContext, CommandMiddleware, CommandRegistry } from "./types.js";

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
    return false;
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

async function runMiddlewareAfterExecute(
  conflux: Conflux,
  started: CommandMiddleware[],
  ctx: CommandContext,
  commandName: string,
): Promise<void> {
  for (let i = started.length - 1; i >= 0; i -= 1) {
    try {
      await started[i]!.afterExecute(ctx);
    } catch (error) {
      await conflux.reportError(error, {
        scope: "middleware-after",
        commandName,
        middlewareIndex: i,
      });
    }
  }
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
  const commandName = parsed.command;
  const middlewares = resolveMiddlewareChain(registry, command, commandsDir);
  const startedMiddleware: CommandMiddleware[] = [];

  try {
    for (let i = 0; i < middlewares.length; i += 1) {
      try {
        await middlewares[i]!.beforeExecute(ctx);
        startedMiddleware.push(middlewares[i]!);
      } catch (error) {
        await conflux.reportError(error, {
          scope: "middleware-before",
          commandName,
          middlewareIndex: i,
        });
        return;
      }
    }

    try {
      await command.message(ctx);
    } catch (error) {
      await conflux.reportError(error, { scope: "command", commandName });
      return;
    }

    if (command.after) {
      try {
        await command.after(ctx);
      } catch (error) {
        await conflux.reportError(error, { scope: "command-after", commandName });
      }
    }
  } finally {
    await runMiddlewareAfterExecute(conflux, startedMiddleware, ctx, commandName);
  }
}
