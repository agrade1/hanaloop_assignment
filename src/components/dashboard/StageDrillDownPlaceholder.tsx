import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StageDrillDownPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Stage Drill-down
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Donut · 적층 차트에서 단계를 선택하면 해당 단계의 활동별 분해를 보여줌
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-7">
            <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border bg-muted/40">
              <span className="text-sm text-muted-foreground">
                Activity breakdown chart
              </span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="flex h-48 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/40">
              <span className="text-sm text-muted-foreground">
                Insight summary
              </span>
              <span className="text-xs text-muted-foreground">
                예: &ldquo;원소재 중 플라스틱 1이 78% 차지&rdquo;
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
