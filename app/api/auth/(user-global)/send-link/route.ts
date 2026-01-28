import {
  addMinutesToDate,
  generatePageToken,
  getIpAddressAndUserAgent,
  prisma,
} from "@/lib/utils";
import { sendLink } from "@/template/email/reset-password/SendLink";
import { sendEmail } from "@/utils/sendEmail";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const { ip, userAgent } = await getIpAddressAndUserAgent(request);
    const teacherDevice = await prisma.teacherDevice.findFirst({
      where: { ip, userAgent },
      select: { id: true },
    });
    const studentDevice = await prisma.studentDevice.findFirst({
      where: { ip, userAgent },
      select: { id: true },
    });
    if (!teacherDevice && !studentDevice) {
      return NextResponse.json(
        { success: false, error: "Unauthorized device" },
        { status: 403 }
      );
    }
    const { email } = (await request.json()) as { email: string };
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" },
        { status: 400 });
    }
    const now = new Date();
    const expiresAt = addMinutesToDate(15);
    const student = await prisma.student.findUnique({ where: { email } });
    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!student && !teacher) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }
    if (student?.resetPasswordTokenExpiresAt && student.resetPasswordTokenExpiresAt > now) {
      return NextResponse.json(
        { success: false, error: "Reset link already sent" },
        { status: 429 },
      );
    }
    if (teacher?.resetPasswordTokenExpiresAt && teacher.resetPasswordTokenExpiresAt > now) {
      return NextResponse.json(
        { success: false, error: "Reset link already sent" },
        { status: 429 },
      );
    }
    if (student) {
      const token = generatePageToken();
      await prisma.student.update({
        where: { id: student.id },
        data: {
          resetPasswordPageToken: token,
          resetPasswordTokenExpiresAt: expiresAt,
        },
      });
      if (studentDevice) {
        await prisma.studentDevice.update({
          where: { id: studentDevice.id },
          data: { isResetPassword: true },
        });
      }
      await sendEmail({
        from: process.env.EMAIL_DOMAIN!,
        to: student.email,
        subject: "إعادة تعيين كلمة المرور",
        html: sendLink(token),
      });
    }
    if (teacher) {
      const token = generatePageToken();
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          resetPasswordPageToken: token,
          resetPasswordTokenExpiresAt: expiresAt,
        },
      });
      if (teacherDevice) {
        await prisma.teacherDevice.update({
          where: { id: teacherDevice.id },
          data: { isResetPassword: true },
        });
      }
      await sendEmail({
        from: process.env.EMAIL_DOMAIN!,
        to: teacher.email,
        subject: "إعادة تعيين كلمة المرور",
        html: sendLink(token),
      });
    }
    return NextResponse.json({
      success: true,
      message: "Reset password email sent",
    });
  }catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: `Fatal Error: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    );
  }
}