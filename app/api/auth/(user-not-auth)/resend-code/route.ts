import {
  addMinutesToDate,
  generate6DigitCode,
  getIpAddressAndUserAgent,
  prisma,
} from "@/lib/utils";
import { sendEmail } from "@/utils/sendEmail";
import { blockAuthenticatedUser } from "@/middleware/user-not-auth.middleware";
import { sendCodeHtml } from "@/template/email/verification-code/SendCode";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const block = await blockAuthenticatedUser(request);
    if (block) return block;
    const { ip, userAgent } = await getIpAddressAndUserAgent(request);
    const { verificationTokenPage } = (await request.json()) as {
      verificationTokenPage: string;
    };
    const now = new Date();
    const studentDevice = await prisma.studentDevice.findFirst({
      where: {
        pageToken: verificationTokenPage,
        pageExpiresAt: { gt: now },
        ip,
        userAgent,
      },
    });
    const teacherDevice = !studentDevice
      ? await prisma.teacherDevice.findFirst({
          where: {
            pageToken: verificationTokenPage,
            pageExpiresAt: { gt: now },
            ip,
            userAgent,
          },
        })
      : null;
    const device = studentDevice || teacherDevice;
    if (!device) {
      return NextResponse.json(
        { error: "Device not found", success: false },
        { status: 400 },
      );
    }
    if (device.resendExpiresAt && device.resendExpiresAt > now) {
      return NextResponse.json(
        { error: "Please wait before resending", success: false },
        { status: 429 },
      );
    }
    const code = generate6DigitCode() as NumericString;
    if (studentDevice) {
      const student = await prisma.studentDevice.update({
        where: { id: studentDevice.id },
        data: {
          code,
          codeExpiresAt: addMinutesToDate(10),
          resendExpiresAt: addMinutesToDate(1),
        },
        select: {
          student: {
            select: {
              email: true,
            },
          },
        },
      });
      const sendVerfication = sendCodeHtml(device.code as NumericString);
      await sendEmail({
        from: process.env.EMAIL_DOMAIN!,
        to: student.student.email,
        subject: "توثيق الحساب",
        html: sendVerfication,
      });
    } else if (teacherDevice) {
      const teacher = await prisma.teacherDevice.update({
        where: { id: teacherDevice.id },
        data: {
          code,
          codeExpiresAt: addMinutesToDate(10),
          resendExpiresAt: addMinutesToDate(1),
        },
        select: {
          teacher: {
            select: {
              email: true,
            },
          },
        },
      });
      const sendVerfication = sendCodeHtml(device.code as NumericString);
      await sendEmail({
        from: process.env.EMAIL_DOMAIN!,
        to: teacher.teacher.email,
        subject: "توثيق الحساب",
        html: sendVerfication,
      });
    }
    return NextResponse.json({ success: true }, { status: 200 });
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