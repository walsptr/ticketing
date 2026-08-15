import Joi from "joi";

export const postSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roleId: Joi.string().uuid().required(),
  teamAssignments: Joi.array().items(
    Joi.object({
      teamId: Joi.string().uuid().required(),
      isLeader: Joi.boolean().default(false),
    })
  ).default([]),
  isActive: Joi.boolean().default(true),
});
