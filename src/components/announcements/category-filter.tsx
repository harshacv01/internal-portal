import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { type AnnouncementCategory, announcementCategories } from "@/lib/db/schema";

// Links rather than client state: the server component re-runs with the new
// query, the URL is shareable, and the back button works.
export function CategoryFilter({ active }: { active?: AnnouncementCategory }) {
  return (
    <nav aria-label="Filter by category" className="flex flex-wrap items-center gap-2">
      <FilterLink href="/announcements" isActive={!active}>
        All
      </FilterLink>

      {announcementCategories.map((category) => (
        <FilterLink
          key={category}
          href={`/announcements?category=${category}`}
          isActive={active === category}
        >
          {category}
        </FilterLink>
      ))}
    </nav>
  );
}

function FilterLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} aria-current={isActive ? "page" : undefined} scroll={false}>
      <Badge
        variant={isActive ? "default" : "outline"}
        className="cursor-pointer capitalize"
      >
        {children}
      </Badge>
    </Link>
  );
}
