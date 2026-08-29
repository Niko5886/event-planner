import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let instance: Database | null = null;

function createDb(): Database {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

/**
 * Lazily-initialised database client.
 *
 * The client is created on first property access rather than at module load,
 * so importing this module during `next build` (when DATABASE_URL may be
 * absent) does not throw and crash the build. DATABASE_URL is only required
 * the first time a query actually runs at request time.
 */
export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    if (!instance) instance = createDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
