export function HeaderBar() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Product Carbon Footprint Dashboard
        </h1>
        <span className="text-sm text-muted-foreground">CT-045 컴퓨터 화면</span>
      </div>
      <div className="text-sm text-muted-foreground">2025-01 ~ 2025-08</div>
    </header>
  );
}
