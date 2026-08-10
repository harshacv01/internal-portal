import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  type AnnouncementCategory,
  announcements,
  users,
} from "@/lib/db/schema";
import type { CreateAnnouncementInput } from "@/lib/validation/announcements";

// All announcement queries live here. Route handlers and server components call
// these; neither builds queries of its own.

export type Announcement = {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  createdAt: Date;
  author: { id: string; name: string };
};

export async function listAnnouncements(
  category?: AnnouncementCategory,
): Promise<Announcement[]> {
  const rows = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      category: announcements.category,
      createdAt: announcements.createdAt,
      authorId: users.id,
      authorName: users.name,
    })
    .from(announcements)
    // Inner join: authorId is NOT NULL behind a restrict FK, so an announcement
    // without an author cannot exist.
    .innerJoin(users, eq(announcements.authorId, users.id))
    .where(category ? eq(announcements.category, category) : undefined)
    .orderBy(desc(announcements.createdAt));

  return rows.map(({ authorId, authorName, ...announcement }) => ({
    ...announcement,
    author: { id: authorId, name: authorName },
  }));
}

export async function createAnnouncement(
  input: CreateAnnouncementInput,
  authorId: string,
): Promise<Announcement> {
  const [row] = await db
    .insert(announcements)
    .values({ ...input, authorId })
    .returning();

  const [author] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.id, authorId));

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    createdAt: row.createdAt,
    author,
  };
}
