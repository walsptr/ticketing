import { db } from "../../../config/db";
import { users, roles } from "../schemas";
import { Role, UserInsert } from "lib/db/models";
import { hashing } from "lib/utils/hashing";

export async function up() {
  const roleData: Role[] = await db.select().from(roles);

  const data: UserInsert[] = [
    {
      email: "admin@gmail.com",
      name: "Admin",
      password: await hashing("admin123"),
      roleId: roleData.find((role) => role.name === "admin")?.id,
    },
    {
      email: "iqbal@gmail.com",
      name: "Iqbal",
      password: await hashing("test123"),
      roleId: roleData.find((role) => role.name === "consultant")?.id,
    },
    {
      email: "trias@gmail.com",
      name: "Trias",
      password: await hashing("test123"),
      roleId: roleData.find((role) => role.name === "consultant")?.id,
    },
    {
      email: "faaiq@gmail.com",
      name: "Faaiq",
      password: await hashing("test123"),
      roleId: roleData.find((role) => role.name === "consultant")?.id,
    },
    {
      email: "mamat@gmail.com",
      name: "Mamat",
      password: await hashing("test123"),
      roleId: roleData.find((role) => role.name === "consultant")?.id,
    },
    {
      email: "imran@gmail.com",
      name: "Imboy",
      password: await hashing("test123"),
      roleId: roleData.find((role) => role.name === "consultant")?.id,
    },
    {
      email: "williamtp@gmail.com",
      name: "William TP",
      password: await hashing("test123"),
      roleId: roleData.find((role) => role.name === "consultant")?.id,
    },
    {
      email: "chikam@gmail.com",
      name: "Chikam",
      password: await hashing("test123"),
      roleId: roleData.find((role) => role.name === "consultant")?.id,
    },
    {
      email: "dul@gmail.com",
      name: "Dul",
      password: await hashing("test123"),
      roleId: roleData.find((role) => role.name === "project coordinator")?.id,
    },
  ];

  // for (let idx = 0; idx <= faker.number.int({ max: 50 }); idx++) {
  //   data.push({
  //     email: faker.internet.email(),
  //     name: faker.person.firstName(),
  //     password: await hashing("test123"),
  //     roleId: faker.helpers.arrayElement(roleData).id,
  //     teamId: faker.helpers.arrayElement(teamData).id,
  //   });
  // }

  await db.insert(users).values(data);
}

export async function down() {
  await db.delete(users);
}
