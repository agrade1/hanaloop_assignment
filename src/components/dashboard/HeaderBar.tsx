import type { ReactNode } from "react";

import { ExcelUploadButton } from "@/components/dashboard/ExcelUploadButton";
import type { ActivityRecord } from "@/lib/types";

type Props = {
  /** 엑셀 업로드가 검증 통과하면 받는 콜백 — 자식 ExcelUploadButton에 그대로 전달 */
  onUpload?: (activities: ActivityRecord[]) => void;
  /** 업로드 버튼 좌측에 끼울 부가 컨트롤 (dev 모드의 Profiler 측정 카드 등) */
  rightSlot?: ReactNode;
};

export function HeaderBar({ onUpload, rightSlot }: Props = {}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        Product Carbon Footprint Dashboard
      </h1>
      <div className="flex items-center gap-3">
        {rightSlot}
        <ExcelUploadButton onUpload={onUpload} />
      </div>
    </header>
  );
}
