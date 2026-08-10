import type { NextRequest } from "next/server";

import { isSameOrigin } from "@/lib/api/origin";
import {
  badRequest,
  created,
  forbidden,
  validationFailed,
} from "@/lib/api/responses";
import { requireApiRole } from "@/lib/auth/guards";
import { createAnnouncement } from "@/lib/announcements/repository";
import { createAnnouncementSchema } from "@/lib/validation/announcements";

export const runtime = "nodejs";

// No GET: the feed is rendered by a server component that queries the repository
// directly, so a list endpoint would have no caller.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return forbidden("Cross-origin requests are not allowed");
  }

  // Enforced here rather than by hiding the form — hiding UI is not a control.
  const auth = await requireApiRole("admin");
  if ("response" in auth) {
    return auth.response;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON");
  }

  const parsed = createAnnouncementSchema.safeParse(payload);
  if (!parsed.success) {
    return validationFailed(parsed.error);
  }

  // Author comes from the session, never the body.
  const announcement = await createAnnouncement(parsed.data, auth.user.sub);

  return created({ announcement });
}
