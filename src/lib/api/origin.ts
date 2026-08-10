import type { NextRequest } from "next/server";

// Second layer behind SameSite=Lax, which already stops the browser attaching
// the session cookie to a cross-site POST.
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  // curl and server-to-server callers send no Origin, and carry no ambient
  // cookie either. Nothing to check — leave it to the auth guards.
  if (!origin) return true;

  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
