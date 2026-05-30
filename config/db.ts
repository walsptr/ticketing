import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schemas from "../lib/db/schemas";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1000,
  min: 100,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const isLogger = process.env.NODE_ENV === "production";

export const db = drizzle({ client: pool, schema: schemas, logger: !isLogger }); // <-- tambahkan schema di sini
