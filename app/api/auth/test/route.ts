import { NextRequest, NextResponse } from "next/server";
export async function GET(request:NextRequest){
    try{
        return NextResponse.json({
            message: 'Server is connected',
            success: true,
        },{status: 200});
    }catch(error:unknown){
        console.log(error);
        return NextResponse.json({
            error: `Fatal Error: ${error instanceof Error ? error.message : error}`,
            success: false
        },{status: 500});
    }
}