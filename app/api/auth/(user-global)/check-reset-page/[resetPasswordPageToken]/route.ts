import { getIpAddressAndUserAgent, prisma } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request:NextRequest,context: { params: Promise<{ resetPasswordPageToken: string }> }){
 try {
    const { ip, userAgent } = await getIpAddressAndUserAgent(request);
    const teacherDevice = await prisma.teacherDevice.findFirst({
      where: { ip, userAgent, isResetPassword: true },
    });
    const studentDevice = await prisma.studentDevice.findFirst({
      where: { ip, userAgent, isResetPassword: true },
    });
    if (!teacherDevice && !studentDevice) {
      return NextResponse.json(
        { success: false, error: "Unauthorized device" },
        { status: 403 }
      );
    }
    const { resetPasswordPageToken } = await context.params;
    if (!resetPasswordPageToken) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }
    const now = new Date();
    const student = await prisma.student.findFirst({
      where: {
        resetPasswordPageToken,
        resetPasswordTokenExpiresAt: { gte: now },
      },
      select: { id: true, email: true, name: true },
    });
    const teacher = await prisma.teacher.findFirst({
      where: {
        resetPasswordPageToken,
        resetPasswordTokenExpiresAt: { gte: now },
      },
      select: { id: true, email: true, name: true },
    });
    if (!student && !teacher) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, valid: true });
  }catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: `Fatal Error: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    );
  }
}