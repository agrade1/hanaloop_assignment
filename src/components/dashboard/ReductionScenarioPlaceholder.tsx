import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReductionScenarioPlaceholder() {
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
        <div className="flex flex-col gap-3">
          <div className="flex h-28 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/40">
            <span className="text-sm text-muted-foreground">
              Scenario inputs
            </span>
            <span className="text-xs text-muted-foreground">
              단계별 슬라이더는 후속 PR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex h-20 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/40">
              <span className="text-xs text-muted-foreground">Before</span>
              <span className="text-lg font-semibold text-foreground">—</span>
            </div>
            <div className="flex h-20 flex-col items-center justify-center rounded-md border border-dashed border-border bg-primary/10">
              <span className="text-xs text-muted-foreground">After</span>
              <span className="text-lg font-semibold text-primary">—</span>
            </div>
          </div>

          <div className="flex h-16 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/40">
            <span className="text-xs text-muted-foreground">절감 효과</span>
            <span className="text-sm font-medium text-foreground">
              — kgCO₂e (—%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
