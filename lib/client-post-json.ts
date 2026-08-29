const CLIENT_POST_TIMEOUT_MS = 15_000;

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
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response;
}
