export function createPerformanceLifecycle() {
  const controller = new AbortController();
  const cleanups = new Set();
  const tasks = [];
  const schedule = (stop) => {
    const task = Promise.resolve().then(stop);
    // Signal handlers initiate cleanup before the main flow can await it.
    void task.catch(() => {});
    tasks.push(task);
  };
  const cleanup = async () => {
    for (const stop of cleanups) schedule(stop);
    cleanups.clear();
    let results;
    let count;
    do {
      count = tasks.length;
      results = await Promise.allSettled(tasks);
    } while (tasks.length !== count);
    const failures = results.filter((result) => result.status === "rejected").map((result) => result.reason);
    if (failures.length) throw new AggregateError(failures, "Performance resource cleanup failed");
  };
  return {
    signal: controller.signal,
    check: () => controller.signal.throwIfAborted(),
    own(stop) {
      if (controller.signal.aborted) schedule(stop);
      else cleanups.add(stop);
      return () => cleanups.delete(stop);
    },
    cancel(signal) {
      if (!controller.signal.aborted) controller.abort(new Error(`Performance run interrupted (${signal})`));
      return cleanup();
    },
    cleanup,
  };
}
