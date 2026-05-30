import { APIValidationError } from "lib/errors/api/APIValidationError";
import Joi from "joi";
import { logger } from "config/winston";

export function validateAPI<T>(schema: Joi.Schema<T>, payload: Request): T {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const errors: Record<string, string> = {};
    logger.error(error);

    for (const d of error.details) {
      const key = d.context?.label ?? "unknown";
      errors[key] = d.context?.message ?? d.message;
    }
    throw new APIValidationError(errors);
  }

  return value as T;
}
