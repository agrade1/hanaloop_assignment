import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CalculatedEmission, LifecycleStage } from "@/lib/types";
import { formatActivityUnit, formatNumber } from "@/lib/units";

/**
 * 단계 정렬 가중치.
 *
 * 도메인 흐름(원자재 → 제조용 전기 → 유통)에 맞춰 표 안에서도
 * 단계가 자연스러운 순서로 나오게 한다.
 */
const STAGE_ORDER: Record<LifecycleStage, number> = {
  원소재: 1,
  전기: 2,
  운송: 3,
};

type Props = {
  rows: CalculatedEmission[];
};

/**
 * Emission Detail Table.
 *
 * 활동 raw 데이터 + 매칭된 배출계수 + 계산된 배출량 + Scope 분류를
 * 한 행에 모아 보여주는 실무자 뷰의 핵심 표.
 *
 * 같은 일자에 중복 레코드(예: 5월)도 그대로 표시 (DECISIONS의 raw 보존 정책).
 * 정렬은 일자 → 단계(원소재 → 전기 → 운송) → 세부 순.
 */
export function EmissionDetailTable({ rows }: Props) {
  const sorted = [...rows].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.type !== b.type) return STAGE_ORDER[a.type] - STAGE_ORDER[b.type];
    return a.description.localeCompare(b.description);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Emission Detail Table
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          활동량 / 단위 / 배출계수 / 계산된 배출량 / Scope
        </p>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-auto rounded-md border border-border">
          <Table className="w-full table-fixed">
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead className="w-[14%] text-center">일자</TableHead>
                <TableHead className="w-[10%] text-center">단계</TableHead>
                <TableHead className="w-[16%] text-center">세부</TableHead>
                <TableHead className="w-[16%] text-center">활동량</TableHead>
                <TableHead className="w-[14%] text-center">배출계수</TableHead>
                <TableHead className="w-[18%] text-center">배출량</TableHead>
                <TableHead className="w-[12%] text-center">Scope</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row, idx) => (
                <TableRow key={`${row.date}-${row.type}-${row.description}-${idx}`}>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {row.date}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {row.type}
                  </TableCell>
                  <TableCell className="truncate text-center text-muted-foreground">
                    {row.description}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {formatNumber(row.amount, 0)}{" "}
                    <span className="text-xs text-muted-foreground">
                      {formatActivityUnit(row.activityUnit)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    × {row.factor}
                  </TableCell>
                  <TableCell className="text-center font-medium tabular-nums">
                    {formatNumber(row.emission, 2)}{" "}
                    <span className="text-xs text-muted-foreground">
                      kgCO₂e
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                      Scope {row.scope}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
