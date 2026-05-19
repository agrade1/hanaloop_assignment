"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { LifecycleStage, ScenarioReductions } from "@/lib/types";
import { formatNumber, splitEmission } from "@/lib/units";

const STAGES: LifecycleStage[] = ["원소재", "전기", "운송"];

type Props = {
  /** 현재 단계별 감축률 (0~1 비율) */
  reductions: ScenarioReductions;
  /** 슬라이더 변경 핸들러 — value는 0~1 비율로 전달 */
  onChange: (stage: LifecycleStage, value: number) => void;
  /** 감축 적용 전 총 배출량 (kgCO₂e) */
  beforeTotal: number;
  /** 감축 적용 후 총 배출량 (kgCO₂e) */
  afterTotal: number;
};

/**
 * 감축 시나리오 패널 (controlled).
 *
 * 단계별 감축률 슬라이더, Before/After 비교 카드, 절감 효과 요약을 한 카드에 통합.
 * state는 부모(`DashboardClient`)가 보유하므로, 이 컴포넌트는 표시·입력 위임만 담당.
 *
 * 슬라이더 UI는 0~100%로 표시하고, 부모에 전달할 때는 0~1 비율로 변환한다
 * (`applyScenario`가 받는 `ScenarioReductions` 타입과 일치시키기 위함).
 */
export function ReductionScenarioPanel({
  reductions,
  onChange,
  beforeTotal,
  afterTotal,
}: Props) {
  const beforeDisplay = splitEmission(beforeTotal);
  const afterDisplay = splitEmission(afterTotal);
  const savings = beforeTotal - afterTotal;
  const savingsDisplay = splitEmission(savings);
  const savingsPct = beforeTotal === 0 ? 0 : (savings / beforeTotal) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Reduction Scenario
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          단계별 감축률을 조정하여 절감 효과를 확인
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-3">
            {STAGES.map((stage) => {
              // 내부 저장은 0~1 비율, 슬라이더 표시는 0~100
              const pct = Math.round((reductions[stage] ?? 0) * 100);
              return (
                <div key={stage} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`scenario-${stage}`}
                      className="text-xs text-foreground"
                    >
                      {stage} 감축률
                    </Label>
                    <span className="text-xs font-medium text-primary">
                      {pct}%
                    </span>
                  </div>
                  <Slider
                    id={`scenario-${stage}`}
                    value={[pct]}
                    onValueChange={(v) =>
                      onChange(
                        stage,
                        (Array.isArray(v) ? v[0] : v) / 100,
                      )
                    }
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex h-20 flex-col items-center justify-center rounded-md border border-border bg-muted/40">
              <span className="text-xs text-muted-foreground">Before</span>
              <span className="text-lg font-semibold text-foreground">
                {beforeDisplay.value}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {beforeDisplay.unit}
              </span>
            </div>
            <div className="flex h-20 flex-col items-center justify-center rounded-md border border-primary/40 bg-primary/10">
              <span className="text-xs text-muted-foreground">After</span>
              <span className="text-lg font-semibold text-primary">
                {afterDisplay.value}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {afterDisplay.unit}
              </span>
            </div>
          </div>

          <div className="flex h-16 flex-col items-center justify-center rounded-md border border-border bg-muted/40">
            <span className="text-xs text-muted-foreground">절감 효과</span>
            <span className="text-sm font-medium text-foreground">
              {savings > 0
                ? `${savingsDisplay.value} ${savingsDisplay.unit} (${formatNumber(savingsPct, 1)}%)`
                : "슬라이더를 조정해보세요"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
