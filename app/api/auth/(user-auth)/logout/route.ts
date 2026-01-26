import { authMiddleware } from "@/middleware/user-auth.middleware";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const result = await authMiddleware(request);
    if (result instanceof NextResponse) return result;
    const response = NextResponse.json(
      {
        success: true,
        message: `User logged out successfully`,
      },
      { status: 200 },
    );
    response.cookies.delete("token");
    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: `Fatal Error: ${error instanceof Error ? error.message : error}`,
        success: false,
      },
      { status: 500 },
    );
  }
}