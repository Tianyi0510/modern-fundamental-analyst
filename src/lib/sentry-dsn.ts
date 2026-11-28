export const testSentryDsn = "https://public@sentry.invalid/1";

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

export function isSentryDeploymentHost(
  host: string,
  deploymentAliases: readonly (string | undefined)[] = [
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
  ],
) {
  return (
    host === "modernfundamentalanalyst.com" ||
    host === "www.modernfundamentalanalyst.com" ||
    host === "modern-fundamental-analyst.vercel.app" ||
    (host.endsWith(".vercel.app") && deploymentAliases.includes(host))
  );
}

export function isSentryLoopbackHost(host: string) {
  return /^(?:localhost|.*\.localhost|127(?:\.\d+){3}|\[::1\])$/.test(host);
}

export function browserSentryConfig(
  publicDsn: string | undefined,
  deployment: string | undefined,
  mode: string | undefined,
  hostname: string,
  deploymentAliases?: readonly (string | undefined)[],
) {
  const dsn = resolveSentryDsn(undefined, publicDsn);
  if (!dsn) return;
  const environment = resolveSentryEnvironment(deployment, mode);
  if (dsn === testSentryDsn) return { dsn, environment };
  if (environment === "test") return;

  const host = hostname.toLowerCase().replace(/\.$/, "");
  // Developers may opt into reporting on their own machine in next dev.
  const localDev = mode === "development" && isSentryLoopbackHost(host);
  if (isSentryDeploymentHost(host, deploymentAliases) || localDev) return { dsn, environment };
}
