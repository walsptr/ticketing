import { db } from "../../../config/db";
import { projects, ticketPhases } from "../schemas";
import { Project, TicketPhasesInsert } from "../models";

export async function up() {
  const projectsData: Project[] = await db.select().from(projects);
  const phases: any[] = [
    {
      name: "Backlog",
      order: 1,
    },
    {
      name: "In Progress",
      order: 2,
    },
    {
      name: "Completed",
      order: 3,
    },
  ];
  const data: TicketPhasesInsert[] = [];

  for (const project of projectsData) {
    for (const phase of phases) {
      data.push({
        ...phase,
        projectId: project.id,
      });
    }
  }

  await db.insert(ticketPhases).values(data);
}

export async function down() {
  await db.delete(ticketPhases);
}
