import {
  addMinutesToDate,
  generate6DigitCode,
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
    const code = generate6DigitCode();
    if (studentDevice) {
      await prisma.studentDevice.update({
        where: { id: studentDevice.id },
        data: {
          code,
          codeExpiresAt: addMinutesToDate(10),
          resendExpiresAt: addMinutesToDate(1),
        },
      });
    } else if (teacherDevice) {
      await prisma.teacherDevice.update({
        where: { id: teacherDevice.id },
        data: {
          code,
          codeExpiresAt: addMinutesToDate(10),
          resendExpiresAt: addMinutesToDate(1),
        },
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