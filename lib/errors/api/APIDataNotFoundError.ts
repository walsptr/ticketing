import { APIResponseError } from "./APIResponseError";

export class APIDataNotFoundError extends APIResponseError {
  constructor(message?: string) {
    super(message ?? "Data not found", 404);
    this.name = "APIDataNotFoundError";
  }
}
