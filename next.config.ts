import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "*.googleusercontent.com" }] },
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  // Giữ file Chromium trong gói function khi deploy lên Vercel
  outputFileTracingIncludes: {
    "/api/**": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
