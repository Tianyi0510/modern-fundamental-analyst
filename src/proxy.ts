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
  matcher: ["/((?!api(?:/|$)|_next(?:/|$)).*)"],
};
