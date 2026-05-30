import Joi from "joi";

export const putSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmNewPassword: Joi.any()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({ "any.only": "Confirm password does not match" }),
  logoutAllDevices: Joi.boolean().optional(),
});
