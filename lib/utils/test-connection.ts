import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false, // hanya untuk testing
  },
});

pool
  .connect()
  .then(() => {
    console.log("✅ Koneksi ke database berhasil!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Gagal konek ke database:", err);
    process.exit(1);
  });
