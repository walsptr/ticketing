import { APIResponseError } from "./APIResponseError";

export class APIAuthenticationError extends APIResponseError {
  constructor() {
    super("Unauthenticated, please sign in again", 401);
    this.name = "APIAuthenticationError";
  }
}
