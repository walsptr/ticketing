import { APIResponseError } from "./APIResponseError";

export class APIServerError extends APIResponseError {
  constructor(message?: string) {
    super(message ?? "Internal Server Error", 500);
    this.name = "APIServerError";
  }
}
