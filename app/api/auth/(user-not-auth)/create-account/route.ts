import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { blockAuthenticatedUser } from "@/middleware/user-not-auth.middleware";
import { emailRegex, nameRegex, passwordRegex } from "@/expressions.regax";
import {
  addMinutesToDate,
  generate6DigitCode,
  generatePageToken,
  getIpAddressAndUserAgent,
} from "@/lib/utils";
import { sendEmail } from "@/utils/sendEmail";
import { prisma } from "@/lib/utils";
import { sendCodeHtml } from "@/template/email/verification-code/SendCode";
export async function POST(request: NextRequest) {
  try {
    const block = await blockAuthenticatedUser(request);
    if (block) {
      return block;
    }
    const { name, email, password, confirmation_password, type } = await request.json() as {
      name: string;
      email: string;
      password: string;
      confirmation_password: string;
      type: "Student" | "Teacher";
    };
    if (!nameRegex.test(name) || !emailRegex.test(email) || !passwordRegex.test(password) || !type) {
      return NextResponse.json({ error: "Error: follow the instructions...", success: false }, { status: 400 });
    }
    if (confirmation_password !== password) {
      return NextResponse.json({ error: "Error: The passwords are not the same", success: false }, { status: 400 });
    }
    let existingUser;
    if (type === "Student") {
      existingUser = await prisma.student.findUnique({ where: { email } });
    } else {
      existingUser = await prisma.teacher.findUnique({ where: { email } });
    }
    if (existingUser) {
      console.log("🔹 user already exists");
      return NextResponse.json({ error: "This user already exists, try another email", success: false }, { status: 400 });
    }
    const { ip, userAgent } = await getIpAddressAndUserAgent(request);
    const code = generate6DigitCode();
    const codeExpiresAt = addMinutesToDate(10);
    const pageExpiresAt = addMinutesToDate(30);
    const resendExpiresAt = addMinutesToDate(1);
    const pageToken = generatePageToken();
    const hashedPassword = await bcrypt.hash(password + process.env.PASSWORD_ENC!, Number(process.env.NUMBER_ENC!));
    if (type === "Student") {
      const student = await prisma.student.create({
        data: { name, email, password: hashedPassword, type },
      });
      const device = await prisma.studentDevice.create({
        data: {
          studentId: student.id,
          ip,
          userAgent,
          code,
          codeExpiresAt,
          pageExpiresAt,
          resendExpiresAt,
          pageToken,
          isVerified: false,
        },
        select: { pageToken: true,code:true },
      });
         const sendVerfication = sendCodeHtml(device.code as NumericString);
              await sendEmail({
                from: process.env.EMAIL_DOMAIN!,
                to: email,
                subject: "توثيق الحساب",
                html: sendVerfication,
              });
      return NextResponse.json({
        pageToken: device.pageToken,
        message: "Student has been created",
        success: true,
      }, { status: 201 });
    } else {
      const teacher = await prisma.teacher.create({
        data: { name, email, password: hashedPassword, type },
      });
      const device = await prisma.teacherDevice.create({
        data: {
          teacherId: teacher.id,
          ip,
          userAgent,
          code,
          codeExpiresAt,
          pageExpiresAt,
          resendExpiresAt,
          pageToken,
          isVerified: false,
        },
        select: { pageToken: true,code:true },
      });
              const sendVerfication = sendCodeHtml(device.code as NumericString);
              await sendEmail({
                from: process.env.EMAIL_DOMAIN!,
                to: email,
                subject: "توثيق الحساب",
                html: sendVerfication,
              });
      return NextResponse.json({
        pageToken: device.pageToken,
        message: "Teacher has been created",
        success: true,
      }, { status: 201 });
    }
  } catch (error: unknown) {
    return NextResponse.json({
      error: `Fatal Error: ${error instanceof Error ? error.message : error}`,
      success: false,
    }, { status: 500 });
  }
}
