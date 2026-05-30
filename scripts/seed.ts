import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

type Seeder = { up?: () => Promise<unknown>; down?: () => Promise<unknown> };

// folder hasil build schema/seeders
const SEED_DIR = path.resolve(__dirname, "../lib/db/seeders");
const exts = new Set([".ts", ".js"]);

async function listFiles() {
  const files = await fs.readdir(SEED_DIR);
  return files
    .filter((f) => exts.has(path.extname(f)))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })); // urut by timestamp
}

async function load(fullPath: string): Promise<Seeder> {
  return (await import(pathToFileURL(fullPath).href)) as Seeder;
}

async function run(cmd: "up" | "down", only?: string) {
  let files = await listFiles();
  if (only) files = files.filter((f) => f.includes(only));
  if (cmd === "down") files.reverse();

  console.log(`Running seed ${cmd} for ${files.length} file(s)...\n`);
  for (const f of files) {
    const full = path.join(SEED_DIR, f);
    const m = await load(full);
    const fn = m[cmd];
    if (typeof fn === "function") {
      console.log("");
      console.log(`${cmd.toUpperCase()}: ${f}`);
      await fn();
    } else {
      console.log(`SKIP (${cmd} not found): ${f}`);
    }
  }
  console.log(`\nDone.`);
  process.exit(0);
}

const [cmd, only] = process.argv.slice(2) as ["up" | "down", string?];
if (cmd !== "up" && cmd !== "down") {
  console.error("Usage: tsx scripts/seed.ts <up|down> [filter]");
  process.exit(1);
}
run(cmd, only).catch((e) => {
  console.error(e);
  process.exit(1);
});
