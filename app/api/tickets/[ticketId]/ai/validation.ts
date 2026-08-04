import Joi from "joi";
import { UpdateTicketAiAutoReplyPayload } from "lib/db/dto/payloads/UpdateTicketAiAutoReplyPayload";

export const patchSchema = Joi.object<UpdateTicketAiAutoReplyPayload>({
  aiAutoReplyEnabled: Joi.boolean().required(),
});
