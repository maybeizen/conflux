import type { MessageCommand } from "@confluxjs/conflux/commands";

export const data = {
  name: "ping",
};

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply("Pong!");
};
