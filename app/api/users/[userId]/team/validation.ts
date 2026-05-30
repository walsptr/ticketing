import Joi from "joi";

export const putSchema = Joi.object({
  teamIds: Joi.array().items(Joi.string().allow(null)).required(),
});
