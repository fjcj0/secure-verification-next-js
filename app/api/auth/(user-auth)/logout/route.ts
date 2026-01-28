import { getIpAddressAndUserAgent, prisma } from "@/lib/utils";
import { authMiddleware } from "@/middleware/user-auth.middleware";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const result = await authMiddleware(request);
    if (result.error) return result.error;
    const {ip,userAgent} = await getIpAddressAndUserAgent(request);
    const deviceStudent = await prisma.studentDevice.findFirst({
      where: {
        ip,
        userAgent,
      },
      select: {
        id:true
      }
    });
    const deviceTeacher = await prisma.teacherDevice.findFirst({
      where: {
        ip,
        userAgent
      },
      select: {
        id:true
      }
    });
    if(!deviceStudent && !deviceStudent){
      return NextResponse.json({
        error: "Error not device found 405 method not allowed"
      },{status: 400});
    }
    if(deviceStudent){
      await prisma.studentDevice.update({
        where:{
          id: deviceStudent.id,
        },
        data:{
          isVerified: false
        }
      });
    }else if(deviceTeacher){
      await prisma.teacherDevice.update({
        where:{
          id: deviceTeacher.id,
        },
        data:{
          isVerified: false
        }
      });
    }
    const response = NextResponse.json(
      {
        success: true,
        message: `User logged out successfully`,
      },
      { status: 200 },
    );
    response.cookies.delete("token");
    return response;
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