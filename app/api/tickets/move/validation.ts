import Joi from "joi";
import { MoveTicketPayload } from "lib/db/dto/payloads/MoveTicketPayload";

export const postSchema = Joi.object<MoveTicketPayload>({
  projectId: Joi.string().required(),
  ticketId: Joi.string().required(),
  fromPhaseId: Joi.string().required(),
  toPhaseId: Joi.string().required(),
  fromIndex: Joi.number().integer().min(0).required(),
  toIndex: Joi.number().integer().min(0).required(),
});

