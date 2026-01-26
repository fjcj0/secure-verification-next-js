import { emailRegax, nameRegax, passwordRegax } from "@/expressions.regax";
import {
  addMinutesToDate,
  generate6DigitCode,
  getIpAddressAndUserAgent,
  prisma,
} from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { blockAuthenticatedUser } from "@/middleware/user-not-auth.middleware";
export async function POST(request: NextRequest) {
  try {
    const block = await blockAuthenticatedUser(request);
    if (block) return block;
    const { name, email, password,confirmation_password, type } = await request.json() as {
      name: string;
      email: string;
      password: string;
      confirmation_password: string;
      type: "Student" | "Teacher";
    };
    if (!nameRegax.test(name) || !emailRegax.test(email) || !passwordRegax.test(password) || !type) {
      return NextResponse.json({ error: "Error: follow the instructions...", success: false }, { status: 400 });
    }
    if(confirmation_password != password){
      return NextResponse.json({
        error: 'Error: The passwords are not the same',
        success: false,
      },{status: 400});
    }
    const existingUser = type === "Student"
      ? await prisma.student.findUnique({ where: { email } })
      : await prisma.teacher.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "This user already exists, try another email", success: false }, { status: 400 });
    }
    const { ip, userAgent } = await getIpAddressAndUserAgent(request);
    const code = generate6DigitCode();
    const codeExpiresAt = addMinutesToDate(10);
    const pageExpiresAt = addMinutesToDate(30);
    const resendExpiresAt = addMinutesToDate(1);
    const hashedPassword = await bcrypt.hash(password + process.env.PASSWORD_ENC!, Number(process.env.NUMBER_ENC!));
    if (type === "Student") {
      const student = await prisma.student.create({ data: { name, email, password: hashedPassword, type } });
      const device = await prisma.studentDevice.create({
        data: { studentId: student.id, ip, userAgent, code, codeExpiresAt, pageExpiresAt, resendExpiresAt, isVerified: false },
        select: { pageToken: true }
      });
      return NextResponse.json({ pageToken: device.pageToken, message: "Student has been created", success: true }, { status: 201 });
    }
    const teacher = await prisma.teacher.create({ data: { name, email, password: hashedPassword, type } });
    const device = await prisma.teacherDevice.create({
      data: { teacherId: teacher.id, ip, userAgent, code, codeExpiresAt, pageExpiresAt, resendExpiresAt, isVerified: false },
      select: { pageToken: true }
    });
    return NextResponse.json({ pageToken: device.pageToken, message: "Teacher has been created", success: true }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: `Fatal Error: ${error instanceof Error ? error.message : error}`, success: false }, { status: 500 });
  }
}