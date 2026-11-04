export function resolveSentryDsn(serverDsn?: string, publicDsn?: string, disabled?: string) {
  // Runtime opt-out must override public values baked into a production build.
  if (disabled === "1") return undefined;
  return serverDsn?.trim() || publicDsn?.trim() || undefined;
}
