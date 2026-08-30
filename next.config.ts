import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Content-Security-Policy", value: "base-uri 'self'; form-action 'self' https://checkout.stripe.com; frame-ancestors 'none'" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  async redirects() {
    const oldSlug = "microsoft-stock-analysis-fy2024";
    const newSlug = "microsoft-stock-analysis-fiscal-year-2024";

    return ["", "/zh-tw", "/zh-cn"].map((prefix) => ({
      source: `${prefix}/memos/${oldSlug}`,
      destination: `${prefix}/memos/${newSlug}`,
      permanent: true,
    }));
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
