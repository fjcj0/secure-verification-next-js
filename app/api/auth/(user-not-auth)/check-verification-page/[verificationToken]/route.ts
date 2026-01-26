import { getIpAddressAndUserAgent, prisma } from "@/lib/utils";
import { blockAuthenticatedUser } from "@/middleware/user-not-auth.middleware";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest, context: { params: Promise<{ verificationToken: string }> }) {
  try {
    const block = await blockAuthenticatedUser(request);
    if (block) return block;
    const { ip, userAgent } = await getIpAddressAndUserAgent(request);
    const { verificationToken } = await context.params;
    const studentDevice = await prisma.studentDevice.findFirst({
      where: {
        pageToken: verificationToken,
        pageExpiresAt: { gt: new Date() },
        ip,
        userAgent,
      },
    });
    const teacherDevice = !studentDevice
      ? await prisma.teacherDevice.findFirst({
          where: {
            pageToken: verificationToken,
            pageExpiresAt: { gt: new Date() },
            ip,
            userAgent,
          },
        })
      : null;
    if (!studentDevice && !teacherDevice) {
      return NextResponse.json(
        { error: "Page expired", success: false },
        { status: 400 },
      );
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
