// Split optional background work without delaying it by an arbitrary duration.
export async function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as typeof globalThis & { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (scheduler?.yield) {
    try {
      await scheduler.yield();
      return;
    } catch {
      // An optional scheduling API must not prevent background work from starting.
    }
  }
  return new Promise((resolve) => setTimeout(resolve, 0));
}
