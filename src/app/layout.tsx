import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { THEME_INITIALIZER_SCRIPT } from "@/lib/theme";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_INITIALIZER_SCRIPT,
          }}
        />
      </head>
      <body
        className="antialiased bg-background text-foreground"
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
