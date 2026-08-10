import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { Card, CardContent } from "@/components/ui/card";
import type { Announcement } from "@/lib/announcements/repository";

export function AnnouncementList({
  announcements,
  filtered,
}: {
  announcements: Announcement[];
  filtered: boolean;
}) {
  if (announcements.length === 0) {
    return <EmptyState filtered={filtered} />;
  }

  return (
    <ul className="space-y-4">
      {announcements.map((announcement) => (
        <li key={announcement.id}>
          <AnnouncementCard announcement={announcement} />
        </li>
      ))}
    </ul>
  );
}

// "Nothing yet" and "nothing in this filter" need different copy.
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="text-sm font-medium">
          {filtered ? "No announcements in this category" : "No announcements yet"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered
            ? "Try clearing the filter to see everything."
            : "Once an admin posts an update, it will show up here."}
        </p>
      </CardContent>
    </Card>
  );
}
