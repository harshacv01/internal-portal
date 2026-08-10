import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "@/lib/env";
import * as schema from "./schema";

type Database = ReturnType<typeof createClient>;

// HTTP driver rather than a TCP pool — serverless invocations are too
// short-lived to reuse connections.
function createClient() {
  return drizzle(neon(env.DATABASE_URL), { schema });
}

let client: Database | null = null;

/**
 * Built on first use, not at import, so `next build` does not need a connection
 * string to collect page data. Cached afterwards, so a warm lambda reuses it.
 */
export function getDb(): Database {
  if (!client) {
    client = createClient();
  }
  return client;
}
