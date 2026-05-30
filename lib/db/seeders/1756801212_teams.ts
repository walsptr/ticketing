import { db } from "../../../config/db";
import { teams } from "../schemas";
import { TeamInsert } from "../models";

export async function up() {
  const data: TeamInsert[] = [
    { name: "Cloud" },
    { name: "DevOps" },
    { name: "Database" },
    { name: "Middleware" },
    { name: "Security" },
    { name: "Infra" },
  ];

  await db.insert(teams).values(data);
}

export async function down() {
  await db.delete(teams);
}
