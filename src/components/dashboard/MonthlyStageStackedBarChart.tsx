"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { LifecycleStage, MonthlyAggregate } from "@/lib/types";

/**
 * Donut과 동일한 단계별 색상 (시각 일관성).
 */
const STAGE_COLORS: Record<LifecycleStage, string> = {
  원소재: "var(--chart-1)",
  전기: "var(--chart-2)",
  운송: "var(--chart-3)",
};

const chartConfig = {
  원소재: { label: "원소재" },
  전기: { label: "전기" },
  운송: { label: "운송" },
} satisfies ChartConfig;

type Props = {
  monthly: MonthlyAggregate[];
};

/**
 * 월별 단계 적층 Bar Chart.
 *
 * 가로축: 월, 세로축: 배출량 (kgCO₂e), 막대 안에 단계가 적층.
 * `aggregateByMonth.byStage`의 단계별 값을 평탄화해 Recharts data로 사용.
 *
 * 시간·단계 두 축을 동시에 보여줘서, 특정 월에 어느 단계가 갑자기 커졌는지
 * (또는 평소 단계 비율과 어떻게 다른지) 직관적으로 보인다.
 */
export function MonthlyStageStackedBarChart({ monthly }: Props) {
  // `byStage`를 펼쳐 한 행에 모든 단계 값이 컬럼으로 들어가게 변환
  const data = monthly.map((m) => ({
    month: m.month,
    원소재: m.byStage.원소재,
    전기: m.byStage.전기,
    운송: m.byStage.운송,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          월별 단계 적층 Bar Chart
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          원소재 / 전기 / 운송 누적
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(value: string) => value.slice(5)}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {/* 적층 순서: 원소재(바닥) → 전기 → 운송(상단). 마지막 Bar에만 top radius 적용. */}
            <Bar
              dataKey="원소재"
              stackId="emission"
              fill={STAGE_COLORS.원소재}
            />
            <Bar dataKey="전기" stackId="emission" fill={STAGE_COLORS.전기} />
            <Bar
              dataKey="운송"
              stackId="emission"
              fill={STAGE_COLORS.운송}
              radius={[4, 4, 0, 0]}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
