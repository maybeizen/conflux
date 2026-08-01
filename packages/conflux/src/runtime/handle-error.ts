export type ConfluxErrorScope =
  | "command"
  | "command-after"
  | "middleware-before"
  | "middleware-after"
  | "event";

export type ConfluxErrorContext = {
  scope: ConfluxErrorScope;
  commandName?: string;
  eventName?: string;
  middlewareIndex?: number;
};

export type ConfluxErrorHandler = (
  error: unknown,
  context: ConfluxErrorContext,
) => void | Promise<void>;

export function defaultConfluxErrorHandler(error: unknown, context: ConfluxErrorContext): void {
  const prefix = `[conflux:${context.scope}]`;
  const detail =
    context.commandName !== undefined
      ? ` command=${context.commandName}`
      : context.eventName !== undefined
        ? ` event=${context.eventName}`
        : "";
  if (error instanceof Error) {
    console.error(`${prefix}${detail}`, error.stack ?? error.message);
    return;
  }
  console.error(`${prefix}${detail}`, error);
}

export async function invokeConfluxErrorHandler(
  handler: ConfluxErrorHandler,
  error: unknown,
  context: ConfluxErrorContext,
): Promise<void> {
  await handler(error, context);
}
