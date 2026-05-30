import { NextRequest, NextResponse } from "next/server";
import { logger } from "../../../config/winston";
import "dotenv/config";
import { File } from "buffer";

function masking(data: Record<string, any>): string {
  const maskingProps: string[] = process.env
    .MASKING_PROPS!.toString()
    .split(",");

  // looping each key value
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      data[key] = "[...]";
    } else if (value instanceof File) {
      data[key] = "File {...}";
    } else if (typeof value === "object" && value !== null) {
      data[key] = "{...}";
    } else if (maskingProps.some((prop) => prop === key)) {
      data[key] = "******";
    }
  }

  return JSON.stringify(data);
}

export function handlingLogging(
  handler: (_req: NextRequest) => Promise<NextResponse>
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const requestId: string = req.headers.get("x-request-id") ?? "";

    // clone request & response, then pass original request
    const cloneRequest = req.clone();
    let requestData: Record<string, any> = {};

    if (
      cloneRequest.body &&
      req.headers.get("Content-Type")?.includes("application/json")
    ) {
      requestData = await cloneRequest.json();
    } else if (
      cloneRequest.body &&
      req.headers.get("Content-Type")?.includes("multipart/form-data;")
    ) {
      const rawRequest = await cloneRequest.formData();
      for (const [key, value] of rawRequest.entries()) {
        requestData[key] = value;
      }
    }

    logger.info({
      message: "Request received",
      method: req.method,
      path: req.nextUrl.pathname,
      requestId: requestId,
      body: masking(requestData),
      params: req.nextUrl.searchParams,
    });

    const response = await handler(req);
    const cloneResponse = response.clone();
    const responseJson = await cloneResponse.json();

    logger.info({
      message: "Response sent",
      request: {
        method: req.method,
        path: req.nextUrl.pathname,
        requestId: requestId,
      },
      status: cloneResponse.status,
      data:
        cloneResponse.body && responseJson.data
          ? masking(responseJson.data)
          : {},
    });

    return response;
  };
}
