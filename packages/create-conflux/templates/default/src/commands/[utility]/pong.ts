import type { MessageCommand } from "@confluxjs/conflux/commands";

export const data = {
  name: "pong",
};

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply(ctx.args().join(" ") || "Pong!");
};
