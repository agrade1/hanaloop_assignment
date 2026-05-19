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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MonthlyAggregate } from "@/lib/types";

/**
 * 차트 시각 토큰.
 *
 * - `label` 은 툴팁·범례 표시용
 * - `color` 는 `var(--chart-1)` 등 globals.css의 녹색 토큰을 그대로 가져와
 *   디자인 시스템과 자동 연동된다.
 *
 * `satisfies ChartConfig` 로 타입 좁히면서도 자동 키 추론을 살린다.
 */
const chartConfig = {
  total: {
    label: "총 배출량",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type Props = {
  monthly: MonthlyAggregate[];
};

/**
 * 월별 PCF Bar Chart.
 *
 * 가로축: 월(2025-01, 2025-02, ...) — 라벨은 짧게 "01", "02" 형태로 자른다.
 * 세로축: 해당 월의 총 배출량 (kgCO₂e).
 *
 * 시간 추이의 계절성·이상치를 시각적으로 파악하기 위한 KPI 차트.
 */
export function MonthlyPcfBarChart({ monthly }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          월별 PCF Bar Chart
        </CardTitle>
        <p className="text-xs text-muted-foreground">월별 총 배출량 추이</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart data={monthly} accessibilityLayer>
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
            <Bar
              dataKey="total"
              fill="var(--color-total)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
