import type { CommandMiddleware } from "@confluxjs/conflux/commands";

export const middleware: CommandMiddleware = {
  async beforeExecute(ctx) {
    console.log(`[utility] before ${ctx.commandName}`);
  },
  async afterExecute(ctx) {
    console.log(`[utility] after ${ctx.commandName}`);
  },
};
