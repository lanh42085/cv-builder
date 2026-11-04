"use client";

import { useEffect, useRef, useState } from "react";
import type { CvData } from "@/lib/cv/schema";
import { toView } from "@/lib/cv/view";
import { CvTemplate } from "./CvTemplate";

/** Khung A4 thu nhỏ vừa cột bên phải; nội dung là chính component template. */
export function Preview({ cv }: { cv: CvData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / 794)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isDraft = toView(cv).isDraft;
  return (
    <div ref={ref} className="w-full">
      {isDraft && (
        <p className="mb-2 text-xs text-neutral-500">
          Bản nháp ghép từ dữ liệu thô. Bấm “Tạo bằng AI” ở các bước About Me, Experience, Projects để AI viết lại câu chữ.
        </p>
      )}
      <div style={{ height: 1123 * scale }} className="overflow-hidden rounded shadow-lg">
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794 }}>
          <CvTemplate cv={cv} />
        </div>
      </div>
    </div>
  );
}
