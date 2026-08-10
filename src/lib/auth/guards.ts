import { redirect } from "next/navigation";

import { forbidden, unauthorized } from "@/lib/api/responses";
import type { UserRole } from "@/lib/db/schema";
import { getSession } from "./cookies";
import type { SessionUser } from "./session";

// Middleware turns anonymous traffic away early, but it matches on URL patterns.
// These guards run inside the handler that touches data, and are what access
// actually depends on.

export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getSession();

  if (!user) {
    const target = returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login";
    redirect(target);
  }

  return user;
}

// Returns the user or the response to send back, so callers stay linear:
//   const auth = await requireApiUser();
//   if ("response" in auth) return auth.response;
export async function requireApiUser(): Promise<
  { user: SessionUser } | { response: Response }
> {
  const user = await getSession();

  if (!user) {
    return { response: unauthorized() };
  }

  return { user };
}

export async function requireApiRole(
  role: UserRole,
): Promise<{ user: SessionUser } | { response: Response }> {
  const auth = await requireApiUser();

  if ("response" in auth) {
    return auth;
  }

  if (auth.user.role !== role) {
    return { response: forbidden(`This action requires the ${role} role`) };
  }

  return auth;
}
