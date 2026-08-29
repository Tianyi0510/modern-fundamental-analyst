export class RequestBodyError extends Error {
  readonly status: 400 | 413;

  constructor(message: string, status: 400 | 413) {
    super(message);
    this.name = "RequestBodyError";
    this.status = status;
  }
}

export function getRequestErrorDetails(error: unknown) {
  return error instanceof RequestBodyError
    ? { message: error.message, status: error.status }
    : { message: "Invalid request.", status: 400 as const };
}

type ProtectedJsonOptions = {
  isRateLimited: (request: Request) => Promise<boolean>;
  maxBytes: number;
  rateLimitWindowMs: number;
};

type ProtectedJsonResult<T extends object> =
  | { ok: true; body: T }
  | { ok: false; response: Response };

function jsonError(message: string, status: number, headers?: HeadersInit) {
  return Response.json({ error: message }, { status, headers });
}

export function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function cleanSingleLine(value: unknown, maxLength: number) {
  return Array.from(cleanText(value, maxLength))
    .map((character) => {
      const code = character.charCodeAt(0);
      if (code > 31 && code !== 127) return character;
      return /\s/.test(character) ? " " : "";
    })
    .join("")
    .replace(/\s+/g, " ");
}

export function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  if (!origin || !host) return false;

  try {
    const requestUrl = new URL(request.url);
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().replace(/:$/, "");
    const protocol = forwardedProtocol || requestUrl.protocol.slice(0, -1);
    if (protocol !== "http" && protocol !== "https") return false;
    return new URL(origin).origin === new URL(`${protocol}://${host}`).origin;
  } catch {
    return false;
  }
}

export async function readLimitedText(request: Request, maxBytes: number) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyError("Request is too large.", 413);
  }

  if (!request.body) throw new RequestBodyError("Invalid request.", 400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError("Request is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(bytes);
}

export async function readLimitedJson(request: Request, maxBytes: number): Promise<unknown> {
  try {
    return JSON.parse(await readLimitedText(request, maxBytes)) as unknown;
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError("Invalid request.", 400);
  }
}

export async function readObjectJson<T extends object>(request: Request, maxBytes: number): Promise<T> {
  const payload = await readLimitedJson(request, maxBytes);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new RequestBodyError("Invalid request.", 400);
  }
  return payload as T;
}

export async function readProtectedObjectJson<T extends object>(
  request: Request,
  { isRateLimited, maxBytes, rateLimitWindowMs }: ProtectedJsonOptions,
): Promise<ProtectedJsonResult<T>> {
  if (!isSameOrigin(request)) {
    return { ok: false, response: jsonError("Invalid request origin.", 403) };
  }

  if (await isRateLimited(request)) {
    return {
      ok: false,
      response: jsonError("Too many requests. Please try again later.", 429, {
        "Retry-After": String(Math.ceil(rateLimitWindowMs / 1000)),
      }),
    };
  }

  try {
    return { ok: true, body: await readObjectJson<T>(request, maxBytes) };
  } catch (error) {
    const { message, status } = getRequestErrorDetails(error);
    return { ok: false, response: jsonError(message, status) };
  }
}
