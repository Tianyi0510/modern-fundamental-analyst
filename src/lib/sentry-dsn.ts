export function resolveSentryDsn(serverDsn?: string, publicDsn?: string, disabled?: string) {
  // Runtime opt-out must override public values baked into a production build.
  if (disabled === "1") return undefined;
  return serverDsn?.trim() || publicDsn?.trim() || undefined;
}

export function resolveSentryEnvironment(deployment: string | undefined, mode: string | undefined) {
  const environment = deployment?.trim();
  if (mode === "test" || environment === "test") return "test";
  return mode === "development" ? "development" : environment || "development";
}

export function browserSentryConfig(
  publicDsn: string | undefined,
  deployment: string | undefined,
  mode: string | undefined,
  hostname: string,
  deploymentAliases: readonly (string | undefined)[] = [],
) {
  const dsn = resolveSentryDsn(undefined, publicDsn);
  if (!dsn) return;
  const environment = resolveSentryEnvironment(deployment, mode);
  if (dsn === "https://public@sentry.invalid/1") return { dsn, environment };
  if (environment === "test") return;

  const host = hostname.toLowerCase().replace(/\.$/, "");
  const deployedHost =
    host === "modernfundamentalanalyst.com" ||
    host === "www.modernfundamentalanalyst.com" ||
    host === "modern-fundamental-analyst.vercel.app" ||
    (host.endsWith(".vercel.app") && deploymentAliases.includes(host));
  // Developers may opt into reporting on their own machine in next dev.
  const localDev = mode === "development" && /^(?:localhost|.*\.localhost|127(?:\.\d+){3}|\[::1\])$/.test(host);
  if (deployedHost || localDev) return { dsn, environment };
}
