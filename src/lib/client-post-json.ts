const CLIENT_POST_TIMEOUT_MS = 45_000;

export class PostJsonError extends Error {
  status: number;
  readonly retryAfterSeconds?: number;
  constructor(status: number, retryAfter: string | null = null) {
    super(`Request failed with status ${status}`);
    this.status = status;
    if (status === 429 && retryAfter) {
      const seconds = /^\d+$/.test(retryAfter)
        ? Number(retryAfter)
        : /GMT$/.test(retryAfter)
          ? Math.ceil((Date.parse(retryAfter) - Date.now()) / 1000)
          : NaN;
      if (Number.isSafeInteger(seconds) && seconds >= 0) this.retryAfterSeconds = seconds;
    }
  }
}

type PostJsonOptions = {
  idempotencyKey?: string;
};

export async function postJson(path: `/api/${string}`, payload: unknown, options: PostJsonOptions = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

  const response = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(CLIENT_POST_TIMEOUT_MS),
  });
  if (!response.ok) throw new PostJsonError(response.status, response.headers.get("Retry-After"));
  return response;
}
