import "server-only";

export function hasProviderId(value: unknown): value is { id: string } {
  return Boolean(
    value && typeof value === "object" && "id" in value && typeof value.id === "string" && value.id.trim(),
  );
}
