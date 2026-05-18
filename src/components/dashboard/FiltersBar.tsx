import { Card } from "@/components/ui/card";

export function FiltersBar() {
  return (
    <Card className="flex flex-row items-center gap-4 px-6 py-3">
      <span className="text-sm font-medium text-foreground">Filters</span>
      <span className="text-sm text-muted-foreground">Stage / Period</span>
      <span className="ml-auto text-xs text-muted-foreground">
        필터 컨트롤은 후속 PR에서 연결
      </span>
    </Card>
  );
}
