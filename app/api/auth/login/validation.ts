import Joi from "joi";

export const postSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
