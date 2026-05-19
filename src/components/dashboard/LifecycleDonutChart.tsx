"use client";

import { Cell, Pie, PieChart } from "recharts";

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
import type { LifecycleStage, StageAggregate } from "@/lib/types";

/**
 * 단계별 색상 매핑.
 *
 * `chartConfig`의 key가 한글이면 shadcn이 자동 생성하는 CSS 변수
 * (`var(--color-{key})`)가 브라우저에서 항상 안전하지 않으므로,
 * 색상은 별도 record로 정의해 Cell에 직접 fill로 전달한다.
 */
const STAGE_COLORS: Record<LifecycleStage, string> = {
  원소재: "var(--chart-1)",
  전기: "var(--chart-2)",
  운송: "var(--chart-3)",
};

/** 툴팁·범례 라벨용 — 색상은 STAGE_COLORS에서 직접 주입하므로 label만 정의 */
const chartConfig = {
  원소재: { label: "원소재" },
  전기: { label: "전기" },
  운송: { label: "운송" },
} satisfies ChartConfig;

type Props = {
  stages: StageAggregate[];
};

/**
 * Lifecycle Donut Chart.
 *
 * 선택 기간의 단계별 배출량을 도넛 차트로 시각화.
 * 어느 단계가 전체에서 큰 비중을 차지하는지 한눈에 보여주는 경영자용 카드.
 */
export function LifecycleDonutChart({ stages }: Props) {
  // total이 0인 단계도 Pie에 포함되면 빈 조각이 나오므로 필터링
  const data = stages
    .filter((s) => s.total > 0)
    .map((s) => ({ stage: s.stage, value: s.total }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Lifecycle Donut
        </CardTitle>
        <p className="text-xs text-muted-foreground">선택 기간 단계별 비중</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="stage" hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="stage"
              innerRadius={60}
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage]} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="stage" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
