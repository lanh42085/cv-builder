import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { fontsHrefAll } from "@/lib/cv/style";

const font = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "UniGap CV Builder",
  description: "Điền dữ liệu thô theo khung hướng dẫn, AI viết thành CV Data Analyst chuẩn, tùy biến theo từng JD.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={font.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontsHrefAll()} rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
