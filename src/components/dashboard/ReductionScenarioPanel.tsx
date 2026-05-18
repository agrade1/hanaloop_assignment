"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type StageKey = "material" | "electricity" | "transport";

const STAGE_LABELS: Record<StageKey, string> = {
  material: "원소재",
  electricity: "전기",
  transport: "운송",
};

export function ReductionScenarioPanel() {
  const [reductions, setReductions] = useState<Record<StageKey, number>>({
    material: 0,
    electricity: 0,
    transport: 0,
  });

  function handleChange(stage: StageKey, value: number) {
    setReductions((prev) => ({ ...prev, [stage]: value }));
  }

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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-3">
            {(Object.keys(STAGE_LABELS) as StageKey[]).map((stage) => (
              <div key={stage} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={`scenario-${stage}`}
                    className="text-xs text-foreground"
                  >
                    {STAGE_LABELS[stage]} 감축률
                  </Label>
                  <span className="text-xs font-medium text-primary">
                    {reductions[stage]}%
                  </span>
                </div>
                <Slider
                  id={`scenario-${stage}`}
                  value={[reductions[stage]]}
                  onValueChange={(v) => handleChange(stage, v[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            ))}
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
