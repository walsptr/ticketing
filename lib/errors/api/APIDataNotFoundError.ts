import { APIResponseError } from "./APIResponseError";

export class APIDataNotFoundError extends APIResponseError {
  constructor() {
    super("Data not found", 404);
    this.name = "APIDataNotFoundError";
  }
}
