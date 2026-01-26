import bcrypt from "bcryptjs";
import { emailRegax, passwordRegax } from "@/expressions.regax";
import {
  addMinutesToDate,
  generate6DigitCode,
  generatePageToken,
  generateTokenAndSetCookie,
  getIpAddressAndUserAgent,
  prisma,
} from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { blockAuthenticatedUser } from "@/middleware/user-not-auth.middleware";
export async function POST(request: NextRequest) {
  try {
    const block = await blockAuthenticatedUser(request);
    if (block) return block;
    const { ip, userAgent } = await getIpAddressAndUserAgent(request);
    const { email, password } = await request.json() as { email: string; password: string };
    if (!emailRegax.test(email) || !passwordRegax.test(password)) {
      return NextResponse.json({ error: "Follow the instructions please...", success: false }, { status: 400 });
    }
    const user = (await prisma.student.findFirst({ where: { email }, orderBy: { createdAt: "desc" } })) ||
                 (await prisma.teacher.findFirst({ where: { email }, orderBy: { createdAt: "desc" } }));
    if (!user) return NextResponse.json({ error: "Invalid credentials", success: false }, { status: 400 });
    const isPasswordValid = await bcrypt.compare(password + process.env.PASSWORD_ENC!, user.password);
    if (!isPasswordValid) return NextResponse.json({ error: "Invalid credentials", success: false }, { status: 400 });
    const code = generate6DigitCode();
    const pageToken = generatePageToken();
    const codeExpiresAt = addMinutesToDate(10);
    const pageExpiresAt = addMinutesToDate(30);
    const resendExpiresAt = addMinutesToDate(1);
    if (user.type === "Student") {
      let device = await prisma.studentDevice.findFirst({ where: { studentId: user.id }, orderBy: { createdAt: "desc" } });
      if (!device || !device.isVerified) {
        if (!device) {
          device = await prisma.studentDevice.create({ data: { studentId: user.id, ip, userAgent, code, pageToken, codeExpiresAt, pageExpiresAt, resendExpiresAt, isVerified: false } });
        } else {
          device = await prisma.studentDevice.update({ where: { id: device.id }, data: { ip, userAgent, code, pageToken, codeExpiresAt, pageExpiresAt, resendExpiresAt } });
        }
        return NextResponse.json({ pageToken, success: true }, { status: 200 });
      }
    } else { 
      let device = await prisma.teacherDevice.findFirst({ where: { teacherId: user.id }, orderBy: { createdAt: "desc" } });
      if (!device || !device.isVerified) {
        if (!device) {
          device = await prisma.teacherDevice.create({ data: { teacherId: user.id, ip, userAgent, code, pageToken, codeExpiresAt, pageExpiresAt, resendExpiresAt, isVerified: false } });
        } else {
          device = await prisma.teacherDevice.update({ where: { id: device.id }, data: { ip, userAgent, code, pageToken, codeExpiresAt, pageExpiresAt, resendExpiresAt } });
        }
        return NextResponse.json({ pageToken, success: true }, { status: 200 });
      }
    }
    const responseUser: NextResponse = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, type: user.type, profilePicture: user.profilePicture }
    }, { status: 200 });
    await generateTokenAndSetCookie(responseUser, {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      type: user.type
    });
    return responseUser;
  } catch (error: unknown) {
    return NextResponse.json({ error: `Fatal Error: ${error instanceof Error ? error.message : error}`, success: false }, { status: 500 });
  }
}