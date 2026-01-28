import { getIpAddressAndUserAgent, prisma } from "@/lib/utils";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
export async function authMiddleware(request: NextRequest) {
  const { ip, userAgent } = await getIpAddressAndUserAgent(request);
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, error: "No token" },
        { status: 403 },
      ),
    };
  }
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const decoded = payload.user as {
      id: string;
      name: string;
      email: string;
      profilePicture: string;
      type: "Teacher" | "Student";
    };
    if (!decoded?.id) {
      return {
        error: NextResponse.json(
          { success: false, error: "Unauthorized or token expired" },
          { status: 401 },
        ),
      };
    }
    let user;
    if (decoded.type === "Student") {
      user = await prisma.student.findUnique({
        where: {
          id: decoded.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          profilePicture: true,
        },
      });
      const checkIfStudentDeviceExist = await prisma.studentDevice.findFirst({
        where: {
          ip,
          userAgent,
          isVerified: true,
          studentId: user?.id,
        },
      });
      if (!checkIfStudentDeviceExist) {
        return {
          error: NextResponse.json(
            { success: false, error: "Unauthorized or token expired" },
            { status: 401 },
          ),
        };
      }
    } else {
      user = await prisma.teacher.findUnique({
        where: {
          id: decoded.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          profilePicture: true,
        },
      });
      const checkIfTeacherDeviceExist = await prisma.teacherDevice.findFirst({
        where: {
          ip,
          userAgent,
          isVerified: true,
          teacherId: user?.id,
        },
      });
      if (!checkIfTeacherDeviceExist) {
        return {
          error: NextResponse.json(
            { success: false, error: "Unauthorized or token expired" },
            { status: 401 },
          ),
        };
      }
    }
    if (!user) {
      return {
        error: NextResponse.json(
          { success: false, error: "User not found" },
          { status: 401 },
        ),
      };
    }
    return {
      user,
    };
  } catch (error) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: `Fatal Error: ${
            error instanceof Error ? error.message : error
          }`,
        },
        { status: 500 },
      ),
    };
  }
}