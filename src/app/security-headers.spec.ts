import { expect, test } from "@playwright/test";

test("rendered routes send the security headers", async ({ request }) => {
  for (const path of ["/", "/zh-tw/about"]) {
    const response = await request.get(path);
    await expect(response).toBeOK();
    const headers = response.headers();
    expect(headers["x-powered-by"]).toBeUndefined();
    expect(headers["content-security-policy"]).toContain("base-uri 'self'");
    expect(headers["content-security-policy"]).toContain("form-action 'self' https://checkout.stripe.com");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["permissions-policy"]).toBe("camera=(), geolocation=(), microphone=()");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
  }
});
