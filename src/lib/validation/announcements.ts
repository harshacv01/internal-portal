import { z } from "zod";

import { announcementCategories } from "@/lib/db/schema";

// Imported by both the form and the route handler so the rules cannot drift.
// The server always re-validates.
export const TITLE_MAX = 120;
export const BODY_MAX = 4000;

export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Give the announcement a title of at least 3 characters")
    .max(TITLE_MAX, `Keep the title under ${TITLE_MAX} characters`),
  body: z
    .string()
    .trim()
    .min(10, "Add a bit more detail — at least 10 characters")
    .max(BODY_MAX, `Keep the announcement under ${BODY_MAX} characters`),
  category: z.enum(announcementCategories, {
    message: "Choose a category",
  }),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

// An unknown ?category= means no filter rather than an error — a stale or
// hand-typed query string should not break the page.
export function parseCategoryFilter(value: string | undefined) {
  if (!value) return undefined;
  const result = z.enum(announcementCategories).safeParse(value);
  return result.success ? result.data : undefined;
}
