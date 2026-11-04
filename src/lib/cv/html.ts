import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import type { CvData } from "./schema";
import { toView } from "./view";
import { AtsSingle } from "@/components/cv/templates/AtsSingle";

/** HTML hoàn chỉnh của 1 trang CV — dùng cho Chromium in PDF. Cùng component với preview. */
export function cvToHtml(cv: CvData, accent = "#1f4e79"): string {
  const body = renderToStaticMarkup(createElement(AtsSingle, { v: toView(cv) }));
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  :root { --accent: ${accent}; }
  .cv-page { page-break-after: always; }
  li, section > div { break-inside: avoid; }
</style></head>
<body>${body}</body></html>`;
}

export function safeFileName(cv: CvData, ext: string): string {
  const name = (cv.basics.fullName || "CV")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
    .replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `${name || "CV"}_DataAnalyst_CV.${ext}`;
}
