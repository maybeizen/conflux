import type { MessageCommand } from "@confluxjs/conflux/commands";

export const data = {
  name: "pong",
  aliases: ["echo"],
};

export const message: MessageCommand = async (ctx) => {
  const text = ctx.args().join(" ") || "Pong!";
  await ctx.message.reply(text);
};
