let eventsHalted = false;

export function resetEventPipeline(): void {
  eventsHalted = false;
}

export function stopAllEvents(): void {
  eventsHalted = true;
}

export function isEventPipelineHalted(): boolean {
  return eventsHalted;
}
