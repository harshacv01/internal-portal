import { cookies } from "next/headers";

import {
  SESSION_COOKIE,
  type SessionUser,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
} from "./session";

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function startSession(user: SessionUser): Promise<void> {
  const token = await signSessionToken(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function endSession(): Promise<void> {
  // Expire in place rather than delete() so the browser clears it using the
  // same attributes it was set with.
  const store = await cookies();
  store.set(SESSION_COOKIE, "", sessionCookieOptions(0));
}
