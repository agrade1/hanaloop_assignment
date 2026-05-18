import { ChartPlaceholder } from "@/components/dashboard/ChartPlaceholder";
import { EmissionDetailTablePlaceholder } from "@/components/dashboard/EmissionDetailTablePlaceholder";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ReductionScenarioPlaceholder } from "@/components/dashboard/ReductionScenarioPlaceholder";

export default function DashboardPage() {
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
              value="10"
              unit="kgCO₂e"
              hint="전체 합계"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <KpiCard
              label="Avg PCF"
              value="20"
              unit="kgCO₂e"
              hint="월 평균"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <KpiCard
              label="Top Lifecycle Stage"
              value="30"
              hint="가장 큰 배출 단계"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <KpiCard label="Hotspot" value="40" hint="단일 활동 최대값" />
          </div>

          <div className="col-span-12 lg:col-span-8">
            <ChartPlaceholder
              title="월별 PCF Bar Chart"
              description="월별 총 배출량 추이"
            />
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

          <div className="col-span-12 lg:col-span-8">
            <EmissionDetailTablePlaceholder />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <ReductionScenarioPlaceholder />
          </div>
        </div>
      </main>
    </div>
  );
}
