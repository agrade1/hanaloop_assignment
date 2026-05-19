"use client";

import {
  Profiler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ProfilerOnRenderCallback,
} from "react";

import { EmissionDetailTable } from "@/components/dashboard/EmissionDetailTable";
import { FiltersBar, type Period } from "@/components/dashboard/FiltersBar";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LifecycleDonutChart } from "@/components/dashboard/LifecycleDonutChart";
import { MonthlyPcfBarChart } from "@/components/dashboard/MonthlyPcfBarChart";
import { MonthlyStageStackedBarChart } from "@/components/dashboard/MonthlyStageStackedBarChart";
import { ProfilerMeasurementCard } from "@/components/dashboard/ProfilerMeasurementCard";
import { ReductionScenarioPanel } from "@/components/dashboard/ReductionScenarioPanel";
import {
  aggregateByMonth,
  aggregateByStage,
  applyScenario,
  averageMonthlyEmission,
  calculateEmissions,
  hotspot,
  topStage,
  totalEmission,
} from "@/lib/calc";
import type {
  ActivityRecord,
  EmissionFactor,
  LifecycleStage,
  ScenarioReductions,
} from "@/lib/types";
import { formatNumber, splitEmission } from "@/lib/units";

const ALL_STAGES: LifecycleStage[] = ["원소재", "전기", "운송"];
const SCENARIO_DEBOUNCE_MS = 500;

/** dev 모드에서만 Profiler 측정 카드를 헤더에 노출 */
const IS_DEV = process.env.NODE_ENV !== "production";

type ProfilerCommit = {
  /** React Profiler의 actualDuration (ms) */
  duration: number;
  /** 측정 시작 기준 경과 시간 (ms) */
  at: number;
};

type Props = {
  /**
   * 서버에서 페치한 초기 활동 데이터.
   * 본 SaaS는 사용자가 엑셀로 활동 데이터를 입력하는 흐름이라 빈 배열로 시작한다.
   * 엑셀 업로드로 교체되면 컴포넌트 내부 state로 덮어쓴다.
   */
  initialActivities: ActivityRecord[];
  factors: EmissionFactor[];
};

/**
 * 대시보드 클라이언트 컨테이너.
 *
 * 네 가지 state를 한 곳에서 관리하고 단방향 흐름으로 자식들에게 흘려보낸다:
 *   1. `activities` — 엑셀 업로드로 교체되는 원본 데이터
 *   2. `selectedStages` — 단계 필터 (멀티 토글)
 *   3. `period` — 기간 필터 (시작/끝 월 범위)
 *   4. `reductions` (+ `pendingReductions`) — 시나리오 감축률.
 *      슬라이더 표시값은 `pending`(즉시 반응), 차트 재계산은 `reductions`(1.5초 디바운스)로 분리해
 *      드래그 중 차트가 매번 다시 그려지는 시각적 부담을 줄임.
 *
 * 데이터 흐름:
 *   activities → [단계 필터] → [기간 필터] → [applyScenario(reductions)] → 모든 KPI/차트/테이블
 */
export function DashboardClient({ initialActivities, factors }: Props) {
  // 1. 활동 데이터 state
  const [activities, setActivities] =
    useState<ActivityRecord[]>(initialActivities);

  // 2. 단계 필터 — 기본은 모두 선택
  const [selectedStages, setSelectedStages] = useState<Set<LifecycleStage>>(
    () => new Set(ALL_STAGES),
  );

  // 3. 기간 필터 — 데이터 페치 후 availableMonths 양 끝으로 자동 세팅
  const [period, setPeriod] = useState<Period>({ start: "", end: "" });

  // 4a. 시나리오 — 슬라이더 즉시 표시용 (pending)
  const [pendingReductions, setPendingReductions] = useState<ScenarioReductions>(
    { 원소재: 0, 전기: 0, 운송: 0 },
  );

  // 4b. 시나리오 — 실제 계산에 사용 (1.5초 디바운스)
  const [reductions, setReductions] = useState<ScenarioReductions>({
    원소재: 0,
    전기: 0,
    운송: 0,
  });

  /** 디바운스: pendingReductions가 1.5초 안정되면 실제 reductions로 반영 */
  useEffect(() => {
    const timer = setTimeout(() => {
      setReductions(pendingReductions);
    }, SCENARIO_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [pendingReductions]);

  /** 슬라이더 변경 핸들러 — pending state만 즉시 업데이트, 실제 차트 갱신은 디바운스 후 */
  const handleReductionChange = (stage: LifecycleStage, value: number) => {
    setPendingReductions((prev) => ({ ...prev, [stage]: value }));
  };

  /** 단계 필터 토글 */
  const handleToggleStage = (stage: LifecycleStage) => {
    setSelectedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) next.delete(stage);
      else next.add(stage);
      return next;
    });
  };

  /** 엑셀 업로드 성공 — 활동 데이터 통째 교체 */
  const handleUploadActivities = (uploaded: ActivityRecord[]) => {
    setActivities(uploaded);
  };

  // ── Profiler 측정 인프라 (dev 모드 전용) ────────────────────────────────
  // 콜백 안에서 setState를 직접 호출하면 commit → onRender → setState → commit 무한 루프가
  // 발생하므로, 측정 중에는 commit을 ref에 누적만 하고 중지 시점에 한 번에 state로 flush한다.
  // 카드 표시 갱신은 측정 종료/리셋 시점에만 일어나 렌더 비용 측정 자체에 영향이 없다.
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [profilerCommits, setProfilerCommits] = useState<ProfilerCommit[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const isMeasuringRef = useRef(false);
  const commitsRef = useRef<ProfilerCommit[]>([]);

  useEffect(() => {
    isMeasuringRef.current = isMeasuring;
  }, [isMeasuring]);

  const handleProfilerRender: ProfilerOnRenderCallback = useCallback(
    (_id, _phase, actualDuration) => {
      if (!isMeasuringRef.current || startedAtRef.current === null) return;
      const at = performance.now() - startedAtRef.current;
      // setState 대신 ref에만 누적 — 리렌더 트리거 안 함으로써 무한 루프 회피
      commitsRef.current.push({ duration: actualDuration, at });
    },
    [],
  );

  const startMeasuring = () => {
    commitsRef.current = [];
    setProfilerCommits([]);
    setElapsedMs(0);
    startedAtRef.current = performance.now();
    setIsMeasuring(true);
  };

  const stopMeasuring = () => {
    if (startedAtRef.current !== null) {
      setElapsedMs(performance.now() - startedAtRef.current);
    }
    // 측정 종료 시점에 한 번에 flush — 이 setState는 측정 후라 무한 루프 위험 없음
    setProfilerCommits([...commitsRef.current]);
    setIsMeasuring(false);
  };

  const resetMeasurement = () => {
    commitsRef.current = [];
    setProfilerCommits([]);
    setElapsedMs(0);
    startedAtRef.current = null;
  };

  // 활동 데이터에서 사용 가능한 월 목록 도출 (오름차순)
  const availableMonths = useMemo(() => {
    const months = new Set(activities.map((a) => a.date.slice(0, 7)));
    return Array.from(months).sort();
  }, [activities]);

  // 활동 데이터가 바뀌면 기간 필터를 양 끝으로 자동 초기화
  useEffect(() => {
    if (availableMonths.length === 0) {
      setPeriod({ start: "", end: "" });
      return;
    }
    setPeriod({
      start: availableMonths[0],
      end: availableMonths[availableMonths.length - 1],
    });
  }, [availableMonths]);

  const hasData = activities.length > 0;

  /** 단계 + 기간 필터 적용된 활동 데이터 */
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (!selectedStages.has(a.type)) return false;
      const month = a.date.slice(0, 7);
      if (period.start && month < period.start) return false;
      if (period.end && month > period.end) return false;
      return true;
    });
  }, [activities, selectedStages, period]);

  // Before: 필터 적용 + 시나리오 미적용
  const beforeCalculated = useMemo(
    () => calculateEmissions(filteredActivities, factors),
    [filteredActivities, factors],
  );
  const beforeTotal = totalEmission(beforeCalculated);

  // After: 필터 적용 + 시나리오 적용 (디바운스된 reductions)
  const calculated = useMemo(
    () => applyScenario(filteredActivities, factors, reductions),
    [filteredActivities, factors, reductions],
  );

  const total = totalEmission(calculated);
  const monthly = aggregateByMonth(calculated);
  const avg = averageMonthlyEmission(monthly);
  const stages = aggregateByStage(calculated);
  const top = topStage(stages);
  const peak = hotspot(calculated);

  const totalDisplay = splitEmission(total);
  const avgDisplay = splitEmission(avg);
  const peakDisplay = peak ? splitEmission(peak.emission) : null;

  return (
    <Profiler id="dashboard" onRender={handleProfilerRender}>
      <div className="flex min-h-screen flex-col">
        <HeaderBar
          onUpload={handleUploadActivities}
          rightSlot={
            IS_DEV ? (
              <ProfilerMeasurementCard
                isMeasuring={isMeasuring}
                commits={profilerCommits}
                elapsedMs={elapsedMs}
                onStart={startMeasuring}
                onStop={stopMeasuring}
                onReset={resetMeasurement}
              />
            ) : undefined
          }
        />
      <main className="flex-1 p-6">
        {!hasData ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <FiltersBar
                selectedStages={selectedStages}
                onToggleStage={handleToggleStage}
                availableMonths={availableMonths}
                period={period}
                onPeriodChange={setPeriod}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <KpiCard
                label="Total PCF"
                value={totalDisplay.value}
                unit={totalDisplay.unit}
                hint="전체 기간 합계"
              />
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <KpiCard
                label="Avg PCF"
                value={avgDisplay.value}
                unit={avgDisplay.unit}
                hint="월 평균"
              />
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <KpiCard
                label="Top Lifecycle Stage"
                value={top?.stage ?? "—"}
                hint={
                  top
                    ? `전체의 ${formatNumber(top.share * 100, 1)}% 차지`
                    : "데이터 없음"
                }
              />
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <KpiCard
                label="Hotspot"
                value={peak?.description ?? "—"}
                hint={
                  peak && peakDisplay
                    ? `${peakDisplay.value} ${peakDisplay.unit} · ${peak.date}`
                    : "데이터 없음"
                }
              />
            </div>

            <div className="col-span-12 lg:col-span-8">
              <MonthlyPcfBarChart monthly={monthly} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <LifecycleDonutChart stages={stages} />
            </div>

            <div className="col-span-12">
              <MonthlyStageStackedBarChart monthly={monthly} />
            </div>

            <div className="col-span-12 lg:col-span-8">
              <EmissionDetailTable rows={calculated} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              {/*
                슬라이더 표시값은 pending(즉시 반응), 부모의 재계산은 debounced reductions.
                Before/After 카드의 afterTotal도 debounced 기준이라 차트와 일관되게 1.5초 뒤 갱신된다.
              */}
              <ReductionScenarioPanel
                reductions={pendingReductions}
                onChange={handleReductionChange}
                beforeTotal={beforeTotal}
                afterTotal={total}
              />
            </div>
          </div>
        )}
      </main>
      </div>
    </Profiler>
  );
}

/**
 * 활동 데이터가 없을 때 보여주는 안내 화면.
 *
 * 사용자가 다음에 무엇을 해야 할지 즉시 알 수 있도록 헤더의 업로드 버튼을 가리킨다.
 */
function EmptyState() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 rounded-md border border-dashed border-border bg-muted/30 p-12 text-center">
      <h2 className="text-lg font-semibold text-foreground">
        활동 데이터를 업로드해주세요
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        아직 입력된 활동 데이터가 없습니다. 헤더 우측의{" "}
        <span className="rounded-md border border-border bg-card px-1.5 py-0.5 text-xs font-medium text-foreground">
          엑셀 업로드
        </span>{" "}
        버튼으로 제품 활동 데이터(.xlsx)를 입력하시면 PCF 계산 결과를 확인할
        수 있습니다.
      </p>
      <p className="text-xs text-muted-foreground">
        잘못된 형식이나 값이 있으면 행 번호와 함께 구체적인 에러 메시지가
        표시됩니다.
      </p>
    </div>
  );
}
