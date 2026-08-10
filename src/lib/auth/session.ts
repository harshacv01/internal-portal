// Subpath imports: jose's barrel pulls in the JWE decrypt path, which reaches
// CompressionStream and warns on the edge runtime.
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { z } from "zod";

import { env } from "@/lib/env";
import { userRoles } from "@/lib/db/schema";

// Token primitives only, no `next/headers`, so middleware can import this too.
// Cookie handling lives in ./cookies.ts.

export const SESSION_COOKIE = "portal_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const ALGORITHM = "HS256";

// Read on first use rather than at import, so the build does not need a secret.
let secretKey: Uint8Array | null = null;
function getSecretKey(): Uint8Array {
  if (!secretKey) {
    secretKey = new TextEncoder().encode(env.SESSION_SECRET);
  }
  return secretKey;
}

const sessionPayloadSchema = z.object({
  sub: z.uuid(),
  email: z.email(),
  name: z.string().min(1),
  role: z.enum(userRoles),
});

export type SessionUser = z.infer<typeof sessionPayloadSchema>;

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

// Null for anything untrustworthy: bad signature, expired, or a payload shape
// that no longer matches. Tokens outlive deploys, so the last case is real.
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: [ALGORITHM],
    });

    const parsed = sessionPayloadSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge: number = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
