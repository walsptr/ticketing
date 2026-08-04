import { db } from "../../../config/db";
import { users, projects } from "../schemas";
import { ProjectInsert, Team } from "../models";
import { fakerID_ID as faker } from "@faker-js/faker";
import { generateSlug } from "lib/utils/slug";
import { eq } from "drizzle-orm";

export async function up() {
  const teamsData: Team[] = await db.query.teams.findMany();
  const dul = await db.query.users.findFirst({
    where: eq(users.name, "Dul"),
  });

  if (!dul) {
    throw new Error("Seeder membutuhkan user project coordinator bernama Dul.");
  }

  const data: ProjectInsert[] = [];

  const devopsTeamId = teamsData.find((team) => team.name === "DevOps")?.id;
  if (devopsTeamId) {
    data.push({
      teamId: devopsTeamId,
      name: "Wacana",
      slug: generateSlug("Wacana"),
      description: "Project Wacana",
      createdBy: dul.id,
    });
  }

  for (const team of teamsData) {
    for (let i = 0; i < 5; i++) {
      const projectName = faker.company.name();
      const tmpData = {
        teamId: team.id,
        name: projectName,
        slug: generateSlug(projectName),
        description: faker.company.catchPhrase(),
        createdBy: dul.id,
      };

      data.push(tmpData);
    }
  }

  await db.insert(projects).values(data);
}

export async function down() {
  await db.delete(projects);
}
