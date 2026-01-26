import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainProvider } from "@/context/MainContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "علمني",
  description:
    "منصة علمني منصة متخصصة لتعليم الطلاب بحيث يستطيع كل طالب معرفة هوايته ويستطيع كل معلم تسجيل مقطع لكل تخصص خاص فيه",
};
export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <MainProvider>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </MainProvider>
    </html>
  );
}