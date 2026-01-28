import {
  generateTokenAndSetCookie,
  getIpAddressAndUserAgent,
  prisma,
} from "@/lib/utils";
import { blockAuthenticatedUser } from "@/middleware/user-not-auth.middleware";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const block = await blockAuthenticatedUser(request);
    if (block) return block;
    const { ip, userAgent } = await getIpAddressAndUserAgent(request);
    const { verificationTokenPage, code } = (await request.json()) as {
      verificationTokenPage: string;
      code: string;
    };
    const now = new Date();
    const studentDevice = await prisma.studentDevice.findFirst({
      where: {
        pageToken: verificationTokenPage,
        code,
        pageExpiresAt: { gt: now },
        codeExpiresAt: { gt: now },
        ip,
        userAgent,
      },
    });
    const teacherDevice = !studentDevice
      ? await prisma.teacherDevice.findFirst({
          where: {
            pageToken: verificationTokenPage,
            code,
            pageExpiresAt: { gt: now },
            codeExpiresAt: { gt: now },
            ip,
            userAgent,
          },
        })
      : null;
    const device = studentDevice || teacherDevice;
    if (!device) {
      return NextResponse.json(
        { error: "Invalid or expired code", success: false },
        { status: 400 },
      );
    }
    let user = null;
    if (studentDevice) {
       const stuDevice = await prisma.studentDevice.update({
       where: { id: studentDevice.id },
        data: {
          isVerified: true,
          code: null,
          codeExpiresAt: null,
          resendExpiresAt: null,
          pageToken: null,
          pageExpiresAt: null,
        },
      });
      user = await prisma.student.findUnique({
        where: { id: studentDevice.studentId },
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
          type: true,
        },
      });
      await prisma.studentDevice.update({
        where: {
          id:stuDevice.id
        },
        data: {
          isResetPassword: false
        }
      });
    } else if (teacherDevice) {
     const teachDevice = await prisma.teacherDevice.update({
        where: { id: teacherDevice.id },
        data: {
          isVerified: true,
          code: null,
          codeExpiresAt: null,
          resendExpiresAt: null,
          pageToken: null,
          pageExpiresAt: null,
        },
      });
      user = await prisma.teacher.findUnique({
        where: { id: teacherDevice.teacherId },
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
          type: true,
        },
      });
      await prisma.teacherDevice.update({
        where: {
          id:teachDevice.id
        },
        data: {
          isResetPassword: false
        }
      });
    }
    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 },
      );
    }
    const response: NextResponse = NextResponse.json(
      { success: true, user },
      { status: 200 },
    );
    await generateTokenAndSetCookie(response, user);
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