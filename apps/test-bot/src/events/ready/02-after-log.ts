import type { EventHandler } from "@confluxjs/conflux/events";

const handler: EventHandler<"ready"> = () => {
  console.log("Conflux ready handlers complete");
};

export default handler;
