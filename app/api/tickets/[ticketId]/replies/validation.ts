import Joi from "joi";
import { CreateTicketReplyPayload } from "lib/db/dto/payloads/CreateTicketReplyPayload";
import { UpdateTicketReplyPayload } from "lib/db/dto/payloads/UpdateTicketReplyPayload";

const contentSchema = Joi.string().trim().min(1).required();

export const postSchema = Joi.object<CreateTicketReplyPayload>({
  content: contentSchema,
});

export const patchSchema = Joi.object<UpdateTicketReplyPayload>({
  content: contentSchema,
});
