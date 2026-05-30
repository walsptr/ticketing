import { APIResponseError } from "./APIResponseError";

export class APIServerError extends APIResponseError {
  constructor() {
    super("Internal Server Error", 500);
    this.name = "APIServerError";
  }
}
