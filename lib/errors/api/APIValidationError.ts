import { APIResponseError } from "./APIResponseError";

export class APIValidationError extends APIResponseError {
  constructor(errors?: Record<string, string>) {
    super("Data is not valid, please check again", 400, errors);
    this.name = "APIValidationError";
  }
}
