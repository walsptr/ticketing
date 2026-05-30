import { db } from "../../../config/db";
import { fakerID_ID as faker } from "@faker-js/faker";
import { assignedToProjects, assignedToTickets, tickets } from "../schemas";
import { AssignedToProject, AssignedToTicketInsert, Ticket } from "../models";

export async function up() {
  const assignedToProjectsData: AssignedToProject[] = await db
    .select()
    .from(assignedToProjects);
  const ticketsData: Ticket[] = await db.select().from(tickets);
  const data: AssignedToTicketInsert[] = [];

  for (const ticket of ticketsData) {
    const filtered: AssignedToProject[] = assignedToProjectsData.filter(
      (assignedProject) => assignedProject.projectId === ticket.projectId
    );

    if (filtered.length === 0) {
      continue;
    }

    data.push({
      userId: faker.helpers.arrayElement(filtered).userId,
      ticketId: ticket.id,
    });
  }

  await db.insert(assignedToTickets).values(data);
}

export async function down() {
  await db.delete(assignedToTickets);
}
