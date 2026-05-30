export class APIResponseError extends Error {
  public status: number;
  public errors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string>
  ) {
    super(message);
    this.status = status;
    this.errors = errors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIResponseError);
    }
    this.name = "APIResponseError";
  }
}
