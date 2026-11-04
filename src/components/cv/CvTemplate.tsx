import type { CvData } from "@/lib/cv/schema";
import { toView } from "@/lib/cv/view";
import { AtsSingle } from "./templates/AtsSingle";
import { TwoColumn } from "./templates/TwoColumn";

/** Chọn template theo cv.templateId — điểm vào duy nhất cho preview và PDF. */
export function CvTemplate({ cv }: { cv: CvData }) {
  const v = toView(cv);
  return cv.templateId === "two-column" ? <TwoColumn v={v} style={cv.style} /> : <AtsSingle v={v} style={cv.style} />;
}
