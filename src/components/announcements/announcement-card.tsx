import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Announcement } from "@/lib/announcements/repository";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-base leading-snug font-semibold">{announcement.title}</h2>
          <Badge variant="secondary" className="capitalize">
            {announcement.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {announcement.author.name}
          {" · "}
          <time dateTime={announcement.createdAt.toISOString()}>
            {dateFormatter.format(announcement.createdAt)}
          </time>
        </p>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
          {announcement.body}
        </p>
      </CardContent>
    </Card>
  );
}
