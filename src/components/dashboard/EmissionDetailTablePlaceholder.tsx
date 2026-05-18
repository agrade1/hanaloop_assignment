import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmissionDetailTablePlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Emission Detail Table
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          활동량 / 단위 / 배출계수 / 계산된 배출량
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex h-80 items-center justify-center rounded-md border border-dashed border-border bg-muted/40">
          <span className="text-sm text-muted-foreground">Table placeholder</span>
        </div>
      </CardContent>
    </Card>
  );
}
