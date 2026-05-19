import { ExcelUploadButton } from "@/components/dashboard/ExcelUploadButton";
import type { ActivityRecord } from "@/lib/types";

type Props = {
  /** 엑셀 업로드가 검증 통과하면 받는 콜백 — 자식 ExcelUploadButton에 그대로 전달 */
  onUpload?: (activities: ActivityRecord[]) => void;
};

export function HeaderBar({ onUpload }: Props = {}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Product Carbon Footprint Dashboard
        </h1>
        <span className="text-sm text-muted-foreground">CT-045 컴퓨터 화면</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">2025-01 ~ 2025-08</span>
        <ExcelUploadButton onUpload={onUpload} />
      </div>
    </header>
  );
}
