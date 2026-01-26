import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/next";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SignJWT } from 'jose';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 70,
      interval: 5,
      capacity: 20,
    }),
  ],
});
export const prisma = new PrismaClient();
export async function getIpAddressAndUserAgent(request: NextRequest): Promise<{ userAgent: string, ip: string }> {
  const userAgent = request.headers.get("user-agent") || "Unknown";
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "Unknown";
  return { userAgent, ip };
}
export function generate6DigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export function addMinutesToDate(minutes: number) {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}
export function generatePageToken(length = 64): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export const generateTokenAndSetCookie = async (
    response: NextResponse,
    user: {
        id: string,
        name: string,
        email: string,
        profilePicture: string,
        type: "Student" | "Teacher",
    }
): Promise<void> => {
    try {
        const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
        const token = await new SignJWT({ user })
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        response.cookies.set({
            name: 'token',
            value: token,
            maxAge: 7 * 24 * 60 * 60,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
            path: '/',
        });
    } catch (error: unknown) {
        throw new Error(error instanceof Error ? error.message : String(error));
    }
};