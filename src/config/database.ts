import "dotenv/config";

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Configure Neon for development (use the DATABASE_URL from .env)
if (process.env.NODE_ENV === "development") {
  // In development, use the remote Neon database URL from .env
  // No special local configuration needed
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL || "");

const db = drizzle(sql);

export { db, sql };
