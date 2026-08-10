import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { type UserRow, users } from "@/lib/db/schema";

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}
