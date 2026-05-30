import { Client } from "pg";
import "dotenv/config";

async function reset() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  // drop schema public (semua tabel, view, function ikut terhapus)
  await client.query("DROP SCHEMA public CASCADE;");
  await client.query("CREATE SCHEMA public;");

  await client.end();
  console.log("✅ Schema dropped & recreated. Now run drizzle push!");
}

reset().catch((err) => {
  console.error(err);
  process.exit(1);
});
