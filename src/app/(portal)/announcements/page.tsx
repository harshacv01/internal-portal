import type { Metadata } from "next";

import { AnnouncementList } from "@/components/announcements/announcement-list";
import { CategoryFilter } from "@/components/announcements/category-filter";
import { NewAnnouncementForm } from "@/components/announcements/new-announcement-form";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/auth/guards";
import { listAnnouncements } from "@/lib/announcements/repository";
import { parseCategoryFilter } from "@/lib/validation/announcements";

export const metadata: Metadata = { title: "Announcements" };

// Reads query the repository directly — no HTTP hop from the server back to its
// own API, and no list in client state. Writes go the other way: the compose
// form POSTs to /api/announcements, then router.refresh() re-runs this.
export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const user = await requireUser("/announcements");
  const { category } = await searchParams;

  const activeCategory = parseCategoryFilter(category);
  const announcements = await listAnnouncements(activeCategory);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
        <p className="text-sm text-muted-foreground">
          What the team has been sharing, newest first.
        </p>
      </div>

      {user.role === "admin" ? (
        <>
          <NewAnnouncementForm />
          <Separator />
        </>
      ) : null}

      <CategoryFilter active={activeCategory} />

      <AnnouncementList announcements={announcements} filtered={Boolean(activeCategory)} />
    </div>
  );
}
