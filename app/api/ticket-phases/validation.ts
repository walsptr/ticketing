import Joi from "joi";
import { CreateTicketPhasePayload } from "lib/db/dto/payloads/CreateTicketPhasePayload";
import { ReorderTicketPhasePayload } from "lib/db/dto/payloads/ReorderTicketPhasePayload";

export const postSchema = Joi.object<CreateTicketPhasePayload>({
  projectId: Joi.string().required(),
  name: Joi.string().trim().min(1).required(),
});

export const reorderSchema = Joi.object<ReorderTicketPhasePayload>({
  projectId: Joi.string().required(),
  phaseIds: Joi.array().items(Joi.string().required()).min(1).required(),
});

export const patchSchema = Joi.object<{ name: string }>({
  name: Joi.string().trim().min(1).required(),
});

