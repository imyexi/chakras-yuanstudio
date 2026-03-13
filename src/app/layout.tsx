import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "脉轮测试-圆圆如意",
  description: "探索你的七大脉轮能量状态，了解身心灵的平衡与和谐",
  keywords: ["脉轮测试", "Chakra", "海底轮", "心轮", "顶轮", "能量测试", "身心灵"],
  authors: [{ name: "圆圆如意" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "脉轮测试-圆圆如意",
    description: "探索你的七大脉轮能量状态，了解身心灵的平衡与和谐",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
