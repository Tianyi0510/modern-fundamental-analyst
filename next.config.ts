import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// Static App Router pages need inline bootstrap scripts. This is an origin policy, not a nonce-based strict CSP.
const contentSecurityPolicy = [
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "script-src-attr 'none'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: { globalNotFound: true },
  poweredByHeader: false,
  // Next.js requires this configuration hook to return a Promise.
  // eslint-disable-next-line @typescript-eslint/require-await
  async redirects() {
    const oldSlug = "microsoft-stock-analysis-fy2024";
    const newSlug = "microsoft-stock-analysis-fiscal-year-2024";

    return [
      ...["", "/zh-tw", "/zh-cn"].map((prefix) => ({
        source: `${prefix}/memos/${oldSlug}`,
        destination: `${prefix}/memos/${newSlug}`,
        permanent: true,
      })),
      ...["icon.svg", "icon.png", "logo.svg", "logo.png", "og-logo.png"].map((filename) => ({
        source: `/images/${filename}`,
        destination: `/${filename}`,
        permanent: true,
      })),
    ];
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  sourcemaps: {
    disable: !(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT),
    deleteSourcemapsAfterUpload: true,
  },
});
