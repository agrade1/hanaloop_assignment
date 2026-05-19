"use client";

import { Button } from "@/components/ui/button";

type Commit = {
  /** React Profiler의 actualDuration (ms) — 이번 commit 렌더링 비용 */
  duration: number;
  /** 측정 시작 기준 경과 시간 (ms) */
  at: number;
};

type Props = {
  /** 현재 측정 중인지 */
  isMeasuring: boolean;
  /** 누적된 commit 기록 */
  commits: Commit[];
  /** 측정 경과 시간 (ms) — 측정 중이면 실시간, 측정 후엔 종료 시점까지 */
  elapsedMs: number;
  /** 측정 시작 (commits 초기화 + 타이머 시작) */
  onStart: () => void;
  /** 측정 중단 (타이머 정지, commits 보존) */
  onStop: () => void;
  /** 결과 초기화 (commits 비움, idle 상태로) */
  onReset: () => void;
};

/**
 * 헤더 우측에 배치되는 컴팩트한 React Profiler 측정 카드.
 *
 * dev 모드에서만 렌더되어, React 19 Compiler 도입 전/후 동일 시나리오의
 * commit 횟수·평균/최대 actualDuration을 직접 비교 가능하게 해준다.
 *
 * 흐름:
 *   idle → 측정 시작 → 시나리오(슬라이더 드래그 등) 수행 → 측정 중단
 *   → 결과 표시 (스크린샷용) → 리셋
 */
export function ProfilerMeasurementCard({
  isMeasuring,
  commits,
  elapsedMs,
  onStart,
  onStop,
  onReset,
}: Props) {
  const count = commits.length;
  const avg =
    count === 0
      ? 0
      : commits.reduce((sum, c) => sum + c.duration, 0) / count;
  const max = count === 0 ? 0 : Math.max(...commits.map((c) => c.duration));
  const elapsedSec = (elapsedMs / 1000).toFixed(1);

  const hasResult = count > 0;
  const showButton: "start" | "stop" | "reset" = isMeasuring
    ? "stop"
    : hasResult
      ? "reset"
      : "start";

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs">
      <span className="font-medium text-foreground">
        {isMeasuring ? "측정 중" : hasResult ? "측정 완료" : "Profiler"}
      </span>
      {(isMeasuring || hasResult) && (
        <span className="tabular-nums text-muted-foreground">
          {elapsedSec}s · {count} commits · avg {avg.toFixed(2)}ms · max{" "}
          {max.toFixed(2)}ms
        </span>
      )}
      {showButton === "start" && (
        <Button variant="outline" size="sm" onClick={onStart}>
          측정 시작
        </Button>
      )}
      {showButton === "stop" && (
        <Button variant="outline" size="sm" onClick={onStop}>
          중단
        </Button>
      )}
      {showButton === "reset" && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          리셋
        </Button>
      )}
    </div>
  );
}
