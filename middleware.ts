import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidV4 } from "uuid";

export async function middleware(request: NextRequest) {
  // set header untuk setiap request
  const newHeaders = new Headers(request.headers);
  newHeaders.set("x-request-id", uuidV4());

  return NextResponse.next({
    request: {
      headers: newHeaders,
    },
  });
}

export const config = {
  matcher: "/api/(.*)",
};
