import type { MessageCommand } from "@confluxjs/conflux/commands";

export const data = {
  name: "say",
};

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply(ctx.args().join(" "));
};
