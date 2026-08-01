import type { EventHandler } from "@confluxjs/conflux";

const handler: EventHandler<"ready"> = (ctx) => {
  console.log(`Logged in as ${ctx.client.user?.username ?? "unknown"}`);
};

export default handler;
