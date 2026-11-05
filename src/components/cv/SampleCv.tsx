import { SAMPLE_CV } from "@/lib/cv/sample";
import { CvTemplate } from "./CvTemplate";

/** CV mẫu thu nhỏ cho trang chủ — chính template thật, không phải ảnh. */
export function SampleCv({ scale = 0.52 }: { scale?: number }) {
  return (
    <div style={{ width: 794 * scale, height: 1123 * scale }} className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-black/5">
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794 }}>
        <CvTemplate cv={SAMPLE_CV} />
      </div>
    </div>
  );
}
