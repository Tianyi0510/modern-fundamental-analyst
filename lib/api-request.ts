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
    return new URL(origin).host === host;
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
