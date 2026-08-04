import { ProjectMemberData } from "./ProjectMemberData";

export type ManageProjectData = {
  id: string;
  teamId: string | null;
  teamName: string | null;
  name: string;
  slug: string;
  description: string | null;
  createdBy: string;
  createdByName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  members: ProjectMemberData[];
};
