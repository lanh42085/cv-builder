import type { CvData } from "@/lib/cv/schema";
import { toView } from "@/lib/cv/view";
import { AtsSingle } from "./templates/AtsSingle";
import { TwoColumn } from "./templates/TwoColumn";
import type { EditApi } from "./Inline";

/** Chọn template theo cv.templateId — điểm vào duy nhất cho preview và PDF. */
export function CvTemplate({ cv, edit }: { cv: CvData; edit?: EditApi | null }) {
  const v = toView(cv);
  return cv.templateId === "two-column" ? <TwoColumn v={v} style={cv.style} order={cv.sectionOrder} /> : <AtsSingle v={v} style={cv.style} order={cv.sectionOrder} edit={edit} />;
}
