"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LifecycleStage } from "@/lib/types";

/** 단계 토글 순서 — 도메인 흐름(원자재 → 제조 → 유통)에 맞춤. */
const STAGES: LifecycleStage[] = ["원소재", "전기", "운송"];

export type Period = {
  /** "yyyy-mm" — 빈 문자열이면 시작 제한 없음 */
  start: string;
  /** "yyyy-mm" — 빈 문자열이면 끝 제한 없음 */
  end: string;
};

type Props = {
  /** 현재 선택된 단계 (멀티 선택, 비어 있으면 모두 숨김) */
  selectedStages: Set<LifecycleStage>;
  /** 토글 버튼 클릭 시 단일 단계만 가감 */
  onToggleStage: (stage: LifecycleStage) => void;
  /** activities에서 동적으로 추출한 사용 가능한 월 목록 (오름차순) */
  availableMonths: string[];
  /** 현재 기간 범위 */
  period: Period;
  /** 기간 변경 핸들러 */
  onPeriodChange: (period: Period) => void;
};

/**
 * 단계 + 기간 필터 컨트롤.
 *
 * controlled 컴포넌트 — state는 부모(`DashboardClient`)가 보유.
 * 단계는 멀티 토글, 기간은 시작/끝 Select 두 개로 범위 지정.
 */
export function FiltersBar({
  selectedStages,
  onToggleStage,
  availableMonths,
  period,
  onPeriodChange,
}: Props) {
  return (
    <Card className="flex flex-row flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3">
      {/* 단계 필터 */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">단계</Label>
        <div className="flex gap-1">
          {STAGES.map((stage) => {
            const active = selectedStages.has(stage);
            return (
              <Button
                key={stage}
                type="button"
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleStage(stage)}
              >
                {stage}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 기간 필터 */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">기간</Label>
        <Select
          value={period.start}
          onValueChange={(v) =>
            onPeriodChange({ ...period, start: String(v) })
          }
        >
          <SelectTrigger size="sm" className="w-28">
            <SelectValue placeholder="시작 월" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">~</span>
        <Select
          value={period.end}
          onValueChange={(v) =>
            onPeriodChange({ ...period, end: String(v) })
          }
        >
          <SelectTrigger size="sm" className="w-28">
            <SelectValue placeholder="끝 월" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
