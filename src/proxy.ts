import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale =
    pathname === "/zh-tw" || pathname.startsWith("/zh-tw/")
      ? "zh-tw"
      : pathname === "/zh-cn" || pathname.startsWith("/zh-cn/")
        ? "zh-cn"
        : "en";
  const headers = new Headers(request.headers);
  // Overwrite untrusted input; only the global 404 reads this routing hint.
  headers.set("x-site-locale", locale);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Exclude known resources, not every dotted path: missing article URLs still need a localized 404.
  matcher: [
    "/((?!api(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|(?:robots\\.txt|sitemap\\.xml|favicon\\.ico|apple-icon\\.png|icon\\.(?:svg|png)|logo\\.(?:svg|png)|og-logo\\.png)$|images/(?:icon\\.(?:svg|png)|logo\\.(?:svg|png)|og-logo\\.png)$).*)",
  ],
};
