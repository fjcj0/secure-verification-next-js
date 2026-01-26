import { addMinutesToDate, generatePageToken, prisma } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email: string };
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }
    const student = await prisma.student.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        profilePicture: true,
        type: true,
        resetPasswordPageToken: true,
        resetPasswordTokenExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const teacher = await prisma.teacher.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        profilePicture: true,
        type: true,
        resetPasswordPageToken: true,
        resetPasswordTokenExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!student && !teacher) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }
    const now = new Date();

    if (
      student?.resetPasswordTokenExpiresAt != null &&
      student.resetPasswordTokenExpiresAt > now
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Reset link already sent. Please check your email.",
        },
        { status: 429 },
      );
    }

    if (
      teacher?.resetPasswordTokenExpiresAt != null &&
      teacher.resetPasswordTokenExpiresAt > now
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Reset link already sent. Please check your email.",
        },
        { status: 429 },
      );
    }
    const resetToken = generatePageToken();
    const expiresAt = addMinutesToDate(15);
    if (student) {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          resetPasswordPageToken: resetToken,
          resetPasswordTokenExpiresAt: expiresAt,
        },
      });
    }
    if (teacher) {
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          resetPasswordPageToken: resetToken,
          resetPasswordTokenExpiresAt: expiresAt,
        },
      });
    }
    return NextResponse.json(
      {
        success: true,
        message: "Password reset email sent",
        resetToken,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: `Fatal Error: ${error instanceof Error ? error.message : error}`,
      },
      { status: 500 },
    );
  }
}