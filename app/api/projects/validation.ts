import Joi from "joi";
import { CreateProjectPayload } from "lib/db/dto/payloads/CreateProjectPayload";
import { UpdateProjectPayload } from "lib/db/dto/payloads/UpdateProjectPayload";
import { UpdateProjectMembersPayload } from "lib/db/dto/payloads/UpdateProjectMembersPayload";

const nameSchema = Joi.string().trim().min(1).max(150).required();

export const postSchema = Joi.object<CreateProjectPayload>({
  name: nameSchema,
  description: Joi.string().trim().allow("", null).optional(),
  teamId: Joi.string().uuid().optional(),
});

export const patchSchema = Joi.object<UpdateProjectPayload>({
  name: nameSchema,
  description: Joi.string().trim().allow("", null).optional(),
});

export const patchMembersSchema = Joi.object<UpdateProjectMembersPayload>({
  consultantIds: Joi.array().items(Joi.string().uuid().required()).unique().required(),
});
