import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { KpiCard } from "@/components/dashboard/KpiCard";

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
              value="—"
              unit="kgCO₂e"
              hint="전체 합계"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <KpiCard
              label="Avg PCF"
              value="—"
              unit="kgCO₂e"
              hint="월 평균"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <KpiCard
              label="Top Lifecycle Stage"
              value="—"
              hint="가장 큰 배출 단계"
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <KpiCard label="Hotspot" value="—" hint="단일 활동 최대값" />
          </div>
        </div>
      </main>
    </div>
  );
}
