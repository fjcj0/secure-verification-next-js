export const runtime = "nodejs"; 
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
      type: "Student" | "Teacher";
    };
    if (!decoded) return null;
    const isFoundStudent = await prisma.student.findUnique({ where: { id: decoded.id } });
    const isFoundTeacher = await prisma.teacher.findUnique({ where: { id: decoded.id } });
    if (!isFoundStudent && !isFoundTeacher) {
      return NextResponse.json(
        { success: false, error: "You are already logged in" },
        { status: 403 }
      );
    }
    return null;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid token" },
      { status: 403 }
    );
  }
}