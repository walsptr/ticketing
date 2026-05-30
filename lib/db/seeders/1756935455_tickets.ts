import { db } from "../../../config/db";
import { fakerID_ID as faker } from "@faker-js/faker";
import { projects, ticketPhases, tickets, users } from "../schemas";
import { Project, TicketInsert, TicketPhase, User } from "../models";

export async function up() {
  const projectsData: Project[] = await db.select().from(projects);
  const ticketPhasesData: TicketPhase[] = await db.select().from(ticketPhases);
  const usersData: User[] = await db.select().from(users);
  const data: TicketInsert[] = [];

  for (const project of projectsData) {
    let backlogOrder: number = 1;
    let inProgressOrder: number = 1;
    let completedOrder: number = 1;

    for (let i = 0; i < 10; i++) {
      const phase: TicketPhase = faker.helpers.arrayElement(ticketPhasesData);
      let ticketOrder: number = 0;

      switch (phase.name) {
        case "Backlog":
          ticketOrder = backlogOrder;
          backlogOrder++;
          break;

        case "In Progress":
          ticketOrder = inProgressOrder;
          inProgressOrder++;
          break;

        case "Completed":
          ticketOrder = completedOrder;
          completedOrder++;
          break;
      }

      data.push({
        projectId: project.id,
        title: faker.lorem.sentence({ min: 3, max: 7 }),
        description: faker.lorem.text(),
        phaseId: phase.id,
        createdBy: faker.helpers.arrayElement(usersData).id,
        referenceCode: faker.string.fromCharacters("1234567890", {
          min: 1,
          max: 5,
        }),
        order: ticketOrder,
      });
    }
  }

  await db.insert(tickets).values(data);
}

export async function down() {
  await db.delete(tickets);
}
