import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const font = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CV Builder cho Data Analyst",
  description: "Tạo CV Data Analyst từ dữ liệu thô, có AI hỗ trợ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={font.variable}>
      <body>{children}</body>
    </html>
  );
}
