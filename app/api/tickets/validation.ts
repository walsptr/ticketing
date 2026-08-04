import Joi from "joi";
import { CreateTicketPayload } from "lib/db/dto/payloads/CreateTicketPayload";
import { UpdateTicketPayload } from "lib/db/dto/payloads/UpdateTicketPayload";

const dueDateSchema = Joi.string().allow("", null).optional();

export const postSchema = Joi.object<CreateTicketPayload>({
  projectId: Joi.string().required(),
  title: Joi.string().trim().min(1).required(),
  description: Joi.string().allow("", null).optional(),
  phaseId: Joi.string().required(),
  dueDate: dueDateSchema,
});

export const patchSchema = Joi.object<UpdateTicketPayload>({
  projectId: Joi.string().required(),
  title: Joi.string().trim().min(1).required(),
  description: Joi.string().allow("", null).optional(),
  phaseId: Joi.string().required(),
  dueDate: dueDateSchema,
});
