import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { hashPassword } from "../src/lib/auth/password";
import { announcements, users } from "../src/lib/db/schema";

// Clears both tables and rewrites them, so it can be re-run without duplicates.
const DEMO_PASSWORD = "portal1234";

const DEMO_USERS = [
  {
    email: "admin@example.com",
    name: "Admin User",
    role: "admin" as const,
  },
  {
    email: "member@example.com",
    name: "Member User",
    role: "member" as const,
  },
];

// Two rows in different categories, so the feed, the category filter and the
// "nothing in this category" empty state all have something to show.
const DEMO_ANNOUNCEMENTS = [
  {
    title: "Welcome to the internal portal",
    body: "This is sample data created by the seed script. Sign in as the admin account to post a new announcement, or as the member account to see the read-only view.",
    category: "general" as const,
  },
  {
    title: "Sample product update",
    body: "A second sample row so the list renders more than one item. Run npm run db:seed at any time to reset back to this state.",
    category: "product" as const,
  },
];

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  }

  const db = drizzle(neon(connectionString));

  console.log("Clearing existing data...");
  await db.delete(announcements);
  await db.delete(users);

  console.log("Creating users...");
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const insertedUsers = await db
    .insert(users)
    .values(DEMO_USERS.map((user) => ({ ...user, passwordHash })))
    .returning({ id: users.id, email: users.email, role: users.role });

  const admin = insertedUsers.find((user) => user.role === "admin");
  if (!admin) {
    throw new Error("Expected an admin user to be created");
  }

  console.log("Creating announcements...");
  // Stagger createdAt so the feed has a real ordering.
  const now = Date.now();
  await db.insert(announcements).values(
    DEMO_ANNOUNCEMENTS.map((announcement, index) => ({
      ...announcement,
      authorId: admin.id,
      createdAt: new Date(now - index * 1000 * 60 * 60 * 19),
    })),
  );

  console.log("\nSeed complete. Sign in with:");
  for (const user of DEMO_USERS) {
    console.log(`  ${user.role.padEnd(6)} ${user.email}  /  ${DEMO_PASSWORD}`);
  }
  console.log("");
}

seed().catch((error) => {
  console.error("\nSeed failed:", error);
  process.exit(1);
});
