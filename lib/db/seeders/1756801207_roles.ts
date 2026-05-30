import { roles } from "../schemas";
import { db } from "../../../config/db";
import { RoleInsert } from "../models";

export async function up() {
  const data: RoleInsert[] = [
    { name: "admin" },
    { name: "consultant" },
    { name: "project coordinator" },
  ];

  await db.insert(roles).values(data);
}

export async function down() {
  await db.delete(roles);
}
