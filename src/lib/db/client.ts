import { NodePgDatabase, drizzle as PgDB } from "drizzle-orm/node-postgres";
import { NeonDatabase, drizzle as NeonDB } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

const isProd = process.env.IS_PROD === "true";
let db: NodePgDatabase<typeof schema> | NeonDatabase<typeof schema>;

if (isProd) {
  db = NeonDB(process.env.DATABASE_URL!, { schema });
} else {
  db = PgDB(process.env.DATABASE_URL!, { schema });
}

export { db };

export type DbClient = typeof db;
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
