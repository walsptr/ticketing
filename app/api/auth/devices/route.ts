import { handlingError } from "lib/middlewares/api/ErrorMiddleware";
import { handlingLogging } from "lib/middlewares/api/LoggingMiddleware";
import { NextRequest, NextResponse } from "next/server";
import { getDevices } from "./service";
import { handlingAuth } from "lib/middlewares/api/AuthMiddleware";
import { DeviceData } from "lib/db/dto/responses/DeviceData";

async function getHandler(req: NextRequest): Promise<NextResponse> {
  const result: DeviceData[] = await getDevices(req);

  return NextResponse.json({
    status: "success",
    message: "Data fetched successfully",
    data: result,
  });
}

export const GET = handlingLogging(handlingError(handlingAuth(getHandler)));
