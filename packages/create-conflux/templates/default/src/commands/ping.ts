import type { MessageCommand } from "@confluxjs/conflux";

export const data = {
  name: "ping",
};

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply("Pong!");
};
