import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChartPlaceholderProps = {
  title: string;
  description?: string;
  height?: string;
};

export function ChartPlaceholder({
  title,
  description,
  height = "h-72",
}: ChartPlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={`${height} flex items-center justify-center rounded-md border border-dashed border-border bg-muted/40`}
        >
          <span className="text-sm text-muted-foreground">Chart placeholder</span>
        </div>
      </CardContent>
    </Card>
  );
}
