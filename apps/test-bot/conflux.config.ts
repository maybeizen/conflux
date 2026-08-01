import { defineConfig } from "@confluxjs/conflux/config";

export default defineConfig({
  commandsDir: "src/commands",
  eventsDir: "src/events",
  token: process.env.BOT_TOKEN,
  outDir: "dist",
});
