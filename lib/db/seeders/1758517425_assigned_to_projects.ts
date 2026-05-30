import { db } from "../../../config/db";
import { AssignedToProjectInsert, Project, UserWithRoleTeam } from "../models";
import { fakerID_ID as faker } from "@faker-js/faker";
import { projects, assignedToProjects } from "../schemas";
import { UserData } from "../dto/responses/UserData";
import { mapperManyUserWithRoleTeam } from "../mapper/UserToTeam";

export async function up() {
  const projectsData: Project[] = await db.select().from(projects);
  const users: UserWithRoleTeam[] = await db.query.users.findMany({
    with: {
      role: true,
      usersToTeams: {
        with: {
          team: true,
        },
      },
    },
  });
  const usersData: UserData[] = mapperManyUserWithRoleTeam(users);
  const data: AssignedToProjectInsert[] = [];

  for (const project of projectsData) {
    const filtered = usersData.filter((user) =>
      user.teams?.some((team) => team.id === project.teamId)
    );

    if (filtered.length === 0) {
      continue;
    }

    data.push({
      projectId: project.id,
      userId: faker.helpers.arrayElement(filtered).id,
    });
  }

  await db.insert(assignedToProjects).values(data);
}

export async function down() {
  await db.delete(assignedToProjects);
}
