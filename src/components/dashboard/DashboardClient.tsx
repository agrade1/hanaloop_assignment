"use client";

import { useState } from "react";

import { EmissionDetailTable } from "@/components/dashboard/EmissionDetailTable";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LifecycleDonutChart } from "@/components/dashboard/LifecycleDonutChart";
import { MonthlyPcfBarChart } from "@/components/dashboard/MonthlyPcfBarChart";
import { MonthlyStageStackedBarChart } from "@/components/dashboard/MonthlyStageStackedBarChart";
import { ReductionScenarioPanel } from "@/components/dashboard/ReductionScenarioPanel";
import { StageDrillDownPlaceholder } from "@/components/dashboard/StageDrillDownPlaceholder";
import {
  aggregateByMonth,
  aggregateByStage,
  applyScenario,
  averageMonthlyEmission,
  calculateEmissions,
  hotspot,
  topStage,
  totalEmission,
} from "@/lib/calc";
import type {
  ActivityRecord,
  EmissionFactor,
  LifecycleStage,
  ScenarioReductions,
} from "@/lib/types";
import { formatNumber, splitEmission } from "@/lib/units";

type Props = {
  activities: ActivityRecord[];
  factors: EmissionFactor[];
};

/**
 * 대시보드 클라이언트 컨테이너.
 *
 * 서버 컴포넌트(`page.tsx`)는 데이터 페치만 담당하고,
 * 이 컴포넌트가 시나리오 `reductions` state를 보유해 모든 자식 컴포넌트의 표시 데이터를 재계산한다.
 *
 * 슬라이더 움직임이 대시보드 전체(KPI·차트)에 즉시 반영되도록 단방향 데이터 흐름:
 *   reductions → applyScenario → calculated → KPI/차트/테이블
 *
 * `beforeTotal`은 시나리오와 무관한 원본 합계로, Before/After 비교 카드에서 사용.
 */
export function DashboardClient({ activities, factors }: Props) {
  // 시나리오 상태 — 기본은 감축 없음(0%)
  const [reductions, setReductions] = useState<ScenarioReductions>({
    원소재: 0,
    전기: 0,
    운송: 0,
  });

  /** 슬라이더 변경 핸들러 — 단일 단계만 갱신, 나머지는 그대로 유지 */
  const handleReductionChange = (stage: LifecycleStage, value: number) => {
    setReductions((prev) => ({ ...prev, [stage]: value }));
  };

  // Before: 원본 그대로 계산 (시나리오 무관)
  const beforeCalculated = calculateEmissions(activities, factors);
  const beforeTotal = totalEmission(beforeCalculated);

  // After: 시나리오 적용 후 재계산. 모든 시각화는 After 기준으로 표시.
  const calculated = applyScenario(activities, factors, reductions);

  const total = totalEmission(calculated);
  const monthly = aggregateByMonth(calculated);
  const avg = averageMonthlyEmission(monthly);
  const stages = aggregateByStage(calculated);
  const top = topStage(stages);
  const peak = hotspot(calculated);

  const totalDisplay = splitEmission(total);
  const avgDisplay = splitEmission(avg);
  const peakDisplay = peak ? splitEmission(peak.emission) : null;

  return (
    <main className="flex-1 p-6">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <FiltersBar />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KpiCard
            label="Total PCF"
            value={totalDisplay.value}
            unit={totalDisplay.unit}
            hint="전체 기간 합계"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KpiCard
            label="Avg PCF"
            value={avgDisplay.value}
            unit={avgDisplay.unit}
            hint="월 평균"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KpiCard
            label="Top Lifecycle Stage"
            value={top?.stage ?? "—"}
            hint={
              top
                ? `전체의 ${formatNumber(top.share * 100, 1)}% 차지`
                : "데이터 없음"
            }
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KpiCard
            label="Hotspot"
            value={peak?.description ?? "—"}
            hint={
              peak && peakDisplay
                ? `${peakDisplay.value} ${peakDisplay.unit} · ${peak.date}`
                : "데이터 없음"
            }
          />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <MonthlyPcfBarChart monthly={monthly} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <LifecycleDonutChart stages={stages} />
        </div>

        <div className="col-span-12">
          <MonthlyStageStackedBarChart monthly={monthly} />
        </div>

        <div className="col-span-12">
          <StageDrillDownPlaceholder />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <EmissionDetailTable rows={calculated} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ReductionScenarioPanel
            reductions={reductions}
            onChange={handleReductionChange}
            beforeTotal={beforeTotal}
            afterTotal={total}
          />
        </div>
      </div>
    </main>
  );
}
