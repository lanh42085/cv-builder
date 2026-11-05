import { SAMPLE_CV } from "@/lib/cv/sample";
import { CvTemplate } from "./CvTemplate";

/** CV mẫu thu nhỏ — chính template thật, không phải ảnh. */
export function SampleCv({ scale = 0.52 }: { scale?: number }) {
  return (
    <div style={{ width: 794 * scale, height: 1123 * scale }} className="overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/5">
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794 }}>
        <CvTemplate cv={SAMPLE_CV} />
      </div>
    </div>
  );
}

/** Khối hero trang chủ: CV mẫu + các thẻ nổi (điểm hoàn thiện, ATS, Skills, hỏi AI) trên nền vòng mờ. */
export function HeroCv() {
  const chips = ["SQL", "Power BI", "Python"];
  return (
    <div className="relative mx-auto h-[640px] w-[560px]">
      {/* vòng mờ phía sau */}
      <div className="absolute -right-10 -top-16 h-[420px] w-[420px] rounded-full opacity-70" style={{ background: "radial-gradient(circle, #cdeee6 0%, #e6f6f1 45%, transparent 70%)" }} />
      <div className="absolute -right-24 -top-28 h-[560px] w-[560px] rounded-full border-[28px] opacity-40" style={{ borderColor: "#d7f1ea" }} />

      {/* CV mẫu */}
      <div className="absolute left-8 top-10">
        <SampleCv scale={0.56} />
      </div>

      {/* Phù hợp JD */}
      <div className="absolute right-2 top-6 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-black/5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-white" style={{ background: "linear-gradient(135deg, var(--accent) 0%, #4fd1b5 100%)" }}>🎯</span>
        <span className="text-base font-semibold leading-tight" style={{ color: "var(--navy)" }}>Phù hợp với<br />từng JD</span>
      </div>

      {/* Điểm hoàn thiện */}
      <div className="absolute -left-6 top-40 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-black/5">
        <span className="rounded-lg px-2.5 py-1.5 text-lg font-bold text-white" style={{ background: "var(--accent)" }}>81%</span>
        <span className="text-sm font-semibold leading-tight" style={{ color: "var(--navy)" }}>Mức hoàn<br />thiện CV</span>
      </div>

      {/* ATS */}
      <div className="absolute right-0 top-[280px] flex items-center gap-2 rounded-2xl px-5 py-3 text-lg font-semibold text-white shadow-xl" style={{ background: "#6c7bf5" }}>
        <span>✓</span> ATS chuẩn
      </div>

      {/* Skills */}
      <div className="absolute right-4 top-[340px] w-[210px] rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5">
        <div className="mb-3 text-sm font-bold" style={{ color: "var(--navy)" }}>Skills ✎</div>
        <div className="grid gap-2">
          {chips.map((c) => <div key={c} className="rounded-lg bg-[#eef6f4] px-3 py-2 text-sm text-neutral-800">{c}</div>)}
        </div>
      </div>
      <div className="absolute right-0 top-[500px] rounded-2xl bg-white px-5 py-3 text-base font-semibold shadow-xl ring-1 ring-black/5" style={{ color: "#5b6cf2" }}>+ Thêm skill</div>

      {/* Hỏi AI */}
      <div className="absolute -left-4 bottom-10 flex w-[330px] items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-black/5">
        <span className="h-6 w-6 rounded-full border-[3px]" style={{ borderColor: "var(--accent)", borderTopColor: "#f59e0b" }} />
        <span className="text-base text-neutral-500">Hỏi AI để làm rõ kinh nghiệm…</span>
      </div>
    </div>
  );
}
