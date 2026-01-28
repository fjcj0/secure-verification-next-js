import { getIpAddressAndUserAgent, prisma } from "@/lib/utils";
import { authMiddleware } from "@/middleware/user-auth.middleware";
import { response } from "express";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request:NextRequest){
try{
    const result = await authMiddleware(request);
    if (result.error) return result.error;
    return result.user;
}catch(error:unknown){
    return NextResponse.json({
        error: `Fatal Error: ${error instanceof Error? error.message : error}`,
        succcess: false
    },{status: 500});
}
}