import { prisma } from "@/lib/utils";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
export async function blockAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const decoded = payload.user as {
      id: string;
      name: string;
      email: string;
      profilePicture: string;
      type: "Teacher" | "Student";
    };
    if (decoded) {
      const isFoundStudent: boolean = (await prisma.student.findUnique({
        where: {
          id: decoded.id,
        },
      }))
        ? true
        : false;
      const isFoundTeacher: boolean = (await prisma.teacher.findUnique({
        where: {
          id: decoded.id,
        },
      }))
        ? true
        : false;
      if (!isFoundStudent && !isFoundTeacher)
        return NextResponse.json(
          {
            success: false,
            error: "You are already logged in",
          },
          {
            status: 403,
          },
        );
    }
    return null;
  } catch (error: unknown) {
    throw new Error(
      `Fatal Error: ${error instanceof Error ? error.message : error}`,
    );
  }
}