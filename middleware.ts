import { NextRequest, NextResponse } from "next/server";
import { aj } from "./lib/utils";
export async function middleware(request: NextRequest) {
  try {
    const decision = await aj.protect(request, { requested: 1 });
    if (decision.isDenied()) {
      const reason = decision.reason;
      if (reason.isRateLimit && reason.isRateLimit()) {
        return NextResponse.json(
          { error: "Rate limit exceeded, Too many requests!" },
          { status: 429 },
        );
      }
      if (reason.isBot && reason.isBot()) {
        return NextResponse.json(
          { error: "Bot access denied!" },
          { status: 403 },
        );
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch (error) {
    console.error("Arcjet error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
  const origin = request.headers.get("origin");
  const allowedOrigins = ["http://localhost:4320", "http://localhost:3000"];
  if (allowedOrigins.includes(request.nextUrl.origin)) {
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", request.nextUrl.origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
    return response;
  }
  return new NextResponse("Forbidden", { status: 403 });
}
export const config = {
  matcher: ["/api/:path*"],
};