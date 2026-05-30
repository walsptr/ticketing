import Joi from "joi";

export const putSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  avatar: Joi.any()
    .custom((value, helper) => {
      if (value) {
        const supportedFormat = [
          "image/jpeg",
          "image/gif",
          "image/heic",
          "image/png",
          "image/svg+xml",
          "image/webp",
        ];

        // verify mime type
        if (!supportedFormat.includes(value.type)) {
          return helper.error("any.invalid", {
            message: "File format isn't supported",
          });
        } else if (value.size > 5 * 1024 * 1024) {
          return helper.error("any.invalid", { message: "Max file is 5MB" });
        }
      }

      return value;
    }, "File validation")
    .optional(),
});
