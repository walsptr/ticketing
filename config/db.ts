import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schemas from "../lib/db/schemas";
import "dotenv/config";
import { getDatabaseSSLConfig } from "lib/utils/env";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getDatabaseSSLConfig(),
  max: 1000,
  min: 100,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const isLogger = process.env.NODE_ENV === "production";

export const db = drizzle({ client: pool, schema: schemas, logger: !isLogger }); // <-- tambahkan schema di sini
