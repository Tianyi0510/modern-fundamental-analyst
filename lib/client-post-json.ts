const CLIENT_POST_TIMEOUT_MS = 45_000;

export class PostJsonError extends Error {
  status: number;
  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.status = status;
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
  if (!response.ok) throw new PostJsonError(response.status);
  return response;
}
