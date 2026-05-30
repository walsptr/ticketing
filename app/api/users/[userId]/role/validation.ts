import Joi from "joi";

export const putSchema = Joi.object({
  roleId: Joi.string().uuid().required(),
});
