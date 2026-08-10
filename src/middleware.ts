import { NextResponse, type NextRequest } from "next/server";

import { unauthorized } from "@/lib/api/responses";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

// Coarse gate, not the security boundary: it bounces signed-out traffic before a
// protected page renders. Real enforcement is in @/lib/auth/guards, which every
// page and route handler calls. Runs on the edge, so it verifies with jose and
// never touches the database.

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PATHS = ["/api/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRequest = pathname.startsWith("/api");

  if (isApiRequest && PUBLIC_API_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = await verifySessionToken(token);

  if (user) {
    if (PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL("/announcements", request.url));
    }
    return NextResponse.next();
  }

  if (isApiRequest) {
    return unauthorized();
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
