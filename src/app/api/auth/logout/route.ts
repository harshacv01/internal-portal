import type { NextRequest } from "next/server";

import { isSameOrigin } from "@/lib/api/origin";
import { forbidden, noContent } from "@/lib/api/responses";
import { endSession } from "@/lib/auth/cookies";

export const runtime = "nodejs";

// POST, not GET: a GET would let any page sign the user out with an <img> tag.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return forbidden("Cross-origin requests are not allowed");
  }

  // Unguarded on purpose — clearing an absent or expired session is harmless,
  // and a 401 here would strand a user on a page whose logout button no longer
  // works.
  await endSession();

  return noContent();
}
