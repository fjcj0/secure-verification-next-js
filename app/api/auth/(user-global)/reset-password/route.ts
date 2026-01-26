import { prisma } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { passwordRegax } from "@/expressions.regax";
export async function POST(request: NextRequest) {
  try {
    const { resetPasswordPageToken, newPassword,confirmation_password } = (await request.json()) as {
      resetPasswordPageToken: string;
      newPassword: string;
      confirmation_password: string
    };
    if (!resetPasswordPageToken || !newPassword || !confirmation_password) {
      return NextResponse.json(
        { success: false, error: "Token and new password are required" },
        { status: 400 }
      );
    }
    if(!passwordRegax.test(newPassword)){
        return NextResponse.json({
            error: 'Error password not contains numbers and symobls and alpha and len more than or equal to 8'
        },{status: 400});
    }
    if(newPassword != confirmation_password){
        return NextResponse.json({
            error: 'Error passwords are not equal',
            success: false
        },{status: 400});
    }
    const now = new Date();
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
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    if (student) {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          password: hashedPassword,
          resetPasswordPageToken: null,
          resetPasswordTokenExpiresAt: null,
        },
      });
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
    }
    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: `Fatal Error: ${error instanceof Error ? error.message : error}`,
      },
      { status: 500 }
    );
  }
}