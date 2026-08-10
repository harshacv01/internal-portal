import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "@/lib/env";
import * as schema from "./schema";

// HTTP driver rather than a TCP pool — serverless invocations are too
// short-lived to reuse connections.
const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });
