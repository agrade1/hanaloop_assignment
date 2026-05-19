"use client";

import { useState } from "react";

import { EmissionDetailTable } from "@/components/dashboard/EmissionDetailTable";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LifecycleDonutChart } from "@/components/dashboard/LifecycleDonutChart";
import { MonthlyPcfBarChart } from "@/components/dashboard/MonthlyPcfBarChart";
import { MonthlyStageStackedBarChart } from "@/components/dashboard/MonthlyStageStackedBarChart";
import { ReductionScenarioPanel } from "@/components/dashboard/ReductionScenarioPanel";
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
  /**
   * 서버에서 페치한 초기 활동 데이터.
   * 본 SaaS는 사용자가 엑셀로 활동 데이터를 입력하는 흐름이라 빈 배열로 시작한다.
   * 엑셀 업로드로 교체되면 컴포넌트 내부 state로 덮어쓴다.
   */
  initialActivities: ActivityRecord[];
  factors: EmissionFactor[];
};

/**
 * 대시보드 클라이언트 컨테이너.
 *
 * 활동 데이터(`activities`)와 시나리오(`reductions`) 두 state를 보유.
 * 둘 다 변할 때마다 `applyScenario`로 재계산해 모든 자식 컴포넌트에 흘려보낸다.
 *
 * 데이터 흐름:
 *   엑셀 업로드 → setActivities → applyScenario → 모든 KPI/차트/테이블
 *   슬라이더 변경 → setReductions → applyScenario → 모든 KPI/차트/테이블
 *
 * `activities`가 비어 있으면 empty state를 보여줘 사용자가 다음 행동(엑셀 업로드)을 알 수 있게 한다.
 */
export function DashboardClient({ initialActivities, factors }: Props) {
  // 활동 데이터 state — 엑셀 업로드로 교체
  const [activities, setActivities] =
    useState<ActivityRecord[]>(initialActivities);

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

  /** 엑셀 업로드 성공 핸들러 — 업로드된 활동 데이터로 통째 교체 */
  const handleUploadActivities = (uploaded: ActivityRecord[]) => {
    setActivities(uploaded);
  };

  const hasData = activities.length > 0;

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
    <div className="flex min-h-screen flex-col">
      <HeaderBar onUpload={handleUploadActivities} />
      <main className="flex-1 p-6">
        {!hasData ? (
          <EmptyState />
        ) : (
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
        )}
      </main>
    </div>
  );
}

/**
 * 활동 데이터가 없을 때 보여주는 안내 화면.
 *
 * 사용자가 다음에 무엇을 해야 할지 즉시 알 수 있도록 헤더의 업로드 버튼을 가리킨다.
 */
function EmptyState() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 rounded-md border border-dashed border-border bg-muted/30 p-12 text-center">
      <h2 className="text-lg font-semibold text-foreground">
        활동 데이터를 업로드해주세요
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        아직 입력된 활동 데이터가 없습니다. 헤더 우측의{" "}
        <span className="rounded-md border border-border bg-card px-1.5 py-0.5 text-xs font-medium text-foreground">
          엑셀 업로드
        </span>{" "}
        버튼으로 제품 활동 데이터(.xlsx)를 입력하시면 PCF 계산 결과를 확인할
        수 있습니다.
      </p>
      <p className="text-xs text-muted-foreground">
        잘못된 형식이나 값이 있으면 행 번호와 함께 구체적인 에러 메시지가
        표시됩니다.
      </p>
    </div>
  );
}