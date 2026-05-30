import { APIResponseError } from "./APIResponseError";

export class APIAuthorizationError extends APIResponseError {
  constructor() {
    super("Unauthorized to access the resource", 403);
    this.name = "APIAuthorizationError";
  }
}
