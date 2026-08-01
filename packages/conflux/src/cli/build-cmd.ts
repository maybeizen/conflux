import { buildBotProject } from "../build/build-bot.js";

export async function runBuildCommand(root?: string): Promise<void> {
  await buildBotProject({ root });
}
