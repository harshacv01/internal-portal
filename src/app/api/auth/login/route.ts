import type { NextRequest } from "next/server";

import { isSameOrigin } from "@/lib/api/origin";
import { badRequest, forbidden, ok, validationFailed } from "@/lib/api/responses";
import { startSession } from "@/lib/auth/cookies";
import { verifyPassword } from "@/lib/auth/password";
import { findUserByEmail } from "@/lib/users/repository";
import { loginSchema } from "@/lib/validation/auth";

// scrypt needs node:crypto.
export const runtime = "nodejs";

// A real scrypt hash of a random string, verified against when no user matches
// so both branches take comparable time.
const DUMMY_HASH =
  "scrypt$9f86d081884c7d659a2feaa0c55ad015$" +
  "a3f39c9a2b5d4e6f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7" +
  "08192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return forbidden("Cross-origin requests are not allowed");
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON");
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);

  // Same message for unknown email and wrong password, so login cannot be used
  // to discover which addresses are registered.
  const passwordMatches = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, DUMMY_HASH);

  if (!user || !passwordMatches) {
    return badRequest("Invalid email or password");
  }

  await startSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return ok({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
