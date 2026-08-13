import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

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
            __html: `(function(){try{var key='chakra-test-theme-v1';var stored=localStorage.getItem(key);var theme=stored==='light'||stored==='dark'?stored:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(theme);root.style.colorScheme=theme}catch(error){var root=document.documentElement;root.classList.remove('dark');root.classList.add('light');root.style.colorScheme='light'}})();`,
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
