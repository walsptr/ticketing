import { db } from "../../../config/db";
import { users, projects } from "../schemas";
import { ProjectInsert, Team, User } from "../models";
import { fakerID_ID as faker } from "@faker-js/faker";
import { generateSlug } from "lib/utils/slug";
import { notInArray } from "drizzle-orm";

export async function up() {
  const teamsData: Team[] = await db.query.teams.findMany();
  const usersData: User[] = await db.query.users.findMany({
    where: notInArray(users.name, ["Admin", "Dul"]),
  });
  const data: ProjectInsert[] = [];

  for (const team of teamsData) {
    for (let i = 0; i < 5; i++) {
      const projectName = faker.company.name();
      const tmpData = {
        teamId: team.id,
        name: projectName,
        slug: generateSlug(projectName),
        description: faker.company.catchPhrase(),
        createdBy: faker.helpers.arrayElement(usersData).id,
      };

      data.push(tmpData);
    }
  }

  await db.insert(projects).values(data);
}

export async function down() {
  await db.delete(projects);
}
