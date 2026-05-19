import { ChartPlaceholder } from "@/components/dashboard/ChartPlaceholder";
import { EmissionDetailTablePlaceholder } from "@/components/dashboard/EmissionDetailTablePlaceholder";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MonthlyPcfBarChart } from "@/components/dashboard/MonthlyPcfBarChart";
import { ReductionScenarioPanel } from "@/components/dashboard/ReductionScenarioPanel";
import { StageDrillDownPlaceholder } from "@/components/dashboard/StageDrillDownPlaceholder";
import {
  aggregateByMonth,
  aggregateByStage,
  averageMonthlyEmission,
  calculateEmissions,
  hotspot,
  topStage,
  totalEmission,
} from "@/lib/calc";
import { staticDataSource } from "@/lib/data-source";
import { formatNumber, splitEmission } from "@/lib/units";

/**
 * 대시보드 페이지 (서버 컴포넌트).
 *
 * 정적 데이터 + 순수 계산이므로 서버 컴포넌트에서 한 번에 페치·계산해
 * 결과를 자식 컴포넌트에 props로 흘려보낸다.
 */
export default async function DashboardPage() {
  // 1. 데이터 페치 (DataSource 인터페이스를 통한 의존)
  const activities = await staticDataSource.getActivities();
  const factors = await staticDataSource.getEmissionFactors();

  // 2. 전체 활동을 계산된 배출량으로 변환
  const calculated = calculateEmissions(activities, factors);

  // 3. KPI 계산
  const total = totalEmission(calculated);
  const monthly = aggregateByMonth(calculated);
  const avg = averageMonthlyEmission(monthly);
  const stages = aggregateByStage(calculated);
  const top = topStage(stages);
  const peak = hotspot(calculated);

  // 4. 표시용 포맷 (값/단위 분리)
  const totalDisplay = splitEmission(total);
  const avgDisplay = splitEmission(avg);
  const peakDisplay = peak ? splitEmission(peak.emission) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderBar />
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
                top ? `전체의 ${formatNumber(top.share * 100, 1)}% 차지` : "데이터 없음"
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
            <ChartPlaceholder
              title="Lifecycle Donut"
              description="선택 기간 단계별 비중"
            />
          </div>

          <div className="col-span-12">
            <ChartPlaceholder
              title="월별 단계 적층 Bar Chart"
              description="원소재 / 전기 / 운송 누적"
              height="h-80"
            />
          </div>

          <div className="col-span-12">
            <StageDrillDownPlaceholder />
          </div>

          <div className="col-span-12 lg:col-span-8">
            <EmissionDetailTablePlaceholder />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <ReductionScenarioPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
