import { getIpAddressAndUserAgent, prisma } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { passwordRegex } from "@/expressions.regax";
export async function POST(request: NextRequest) {
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
    /*
    123$&&OMAoma
    12$&&OMAoma
    */
    const {resetPasswordPageToken,newPassword,confirmation_password} = await request.json();
    if (!resetPasswordPageToken || !newPassword || !confirmation_password) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: "Weak password" },
        { status: 400 }
      );
    }
    if (newPassword !== confirmation_password) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      );
    }
    const now = new Date();
    const hashedPassword = await bcrypt.hash(newPassword+process.env.PASSWORD_ENC!, Number(process.env.NUMBER_ENC!));
    const student = await prisma.student.findFirst({
      where: {
        resetPasswordPageToken,
        resetPasswordTokenExpiresAt: { gte: now },
      },
    });
    const teacher = await prisma.teacher.findFirst({
      where: {
        resetPasswordPageToken,
        resetPasswordTokenExpiresAt: { gte: now },
      },
    });
    if (!student && !teacher) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }
    if (student) {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          password: hashedPassword,
          resetPasswordPageToken: null,
          resetPasswordTokenExpiresAt: null,
        },
      });
      if (studentDevice) {
        await prisma.studentDevice.update({
          where: { id: studentDevice.id },
          data: { isResetPassword: false },
        });
      }
    }
    if (teacher) {
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          password: hashedPassword,
          resetPasswordPageToken: null,
          resetPasswordTokenExpiresAt: null,
        },
      });
      if (teacherDevice) {
        await prisma.teacherDevice.update({
          where: { id: teacherDevice.id },
          data: { isResetPassword: false },
        });
      }
    }
    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: `Fatal Error: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    );
  }
}