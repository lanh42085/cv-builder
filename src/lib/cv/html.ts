import { renderToReadableStream } from "react-dom/server.edge";
import { createElement } from "react";
import type { CvData } from "./schema";
import { CvTemplate } from "@/components/cv/CvTemplate";
import { googleFontsHref } from "./style";

/** HTML hoàn chỉnh của 1 trang CV — dùng cho Chromium in PDF. Cùng component với preview. */
export async function cvToHtml(cv: CvData): Promise<string> {
  const fontHref = googleFontsHref(cv.style.font);
  const stream = await renderToReadableStream(createElement(CvTemplate, { cv }));
  await stream.allReady;
  const body = await new Response(stream).text();
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8">
${fontHref ? `<link href="${fontHref}" rel="stylesheet">` : ""}
<style>
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
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
