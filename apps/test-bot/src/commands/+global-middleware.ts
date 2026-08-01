import type { CommandMiddleware } from "@confluxjs/conflux/commands";

const middleware: CommandMiddleware = {
  async beforeExecute(ctx) {
    console.log(`[global] before ${ctx.commandName}`);
  },
  async afterExecute(ctx) {
    console.log(`[global] after ${ctx.commandName}`);
  },
};

export default middleware;
