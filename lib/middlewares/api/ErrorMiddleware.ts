import { logger } from "config/winston";
import { APIResponseError } from "lib/errors/api/APIResponseError";
import { NextRequest, NextResponse } from "next/server";

type ResponseError = {
  status: string;
  message: string;
  errors?: Record<string, string>;
};

export function handlingError(
  handler: (_req: NextRequest) => Promise<NextResponse>
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    try {
      return await handler(req);
    } catch (error: any) {
      const body: ResponseError = {
        status: "fail",
        message: "Internal Server Error",
      };

      if (error instanceof APIResponseError) {
        body.message = error.message;

        if (error.errors) {
          body.errors = error.errors;
        }

        return NextResponse.json(body, {
          status: error.status,
        });
      }

      logger.error(error.message);
      return NextResponse.json(body, { status: 500 });
    }
  };
}
