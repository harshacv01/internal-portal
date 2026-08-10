import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRoles = ["admin", "member"] as const;
export const announcementCategories = [
  "general",
  "product",
  "ops",
  "people",
] as const;

export const userRoleEnum = pgEnum("user_role", userRoles);
export const announcementCategoryEnum = pgEnum(
  "announcement_category",
  announcementCategories,
);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("member"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    category: announcementCategoryEnum("category").notNull().default("general"),
    // restrict: deleting a user must not silently delete their announcements.
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  // Covers the two feed queries: everything, and filtered by category.
  (table) => [
    index("announcements_created_at_idx").on(table.createdAt.desc()),
    index("announcements_category_created_at_idx").on(
      table.category,
      table.createdAt.desc(),
    ),
  ],
);

export type UserRow = typeof users.$inferSelect;

export type UserRole = (typeof userRoles)[number];
export type AnnouncementCategory = (typeof announcementCategories)[number];
