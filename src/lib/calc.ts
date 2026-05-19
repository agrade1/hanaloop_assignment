/**
 * PCF 계산 모듈.
 *
 * UI 무관 순수 함수만 모은다 (DECISIONS의 "계산 로직과 UI 분리").
 * 모든 함수는 입력을 변형하지 않고 새 객체/배열을 반환.
 *
 * 데이터 흐름:
 *   ActivityRecord[] + EmissionFactor[] → calculateEmissions → CalculatedEmission[]
 *                                       → aggregateByStage / aggregateByMonth
 *                                       → topStage / hotspot / totalEmission
 *   + ScenarioReductions → applyScenario (활동량 곱셈 후 재계산)
 */

import type {
  ActivityRecord,
  CalculatedEmission,
  EmissionFactor,
  LifecycleStage,
  MonthlyAggregate,
  Scope,
  ScenarioReductions,
  StageAggregate,
} from "@/lib/types";

// ---------- 1. 단일 값 계산 ----------

/**
 * 활동량 × 배출계수 = 배출량.
 *
 * 단위 차원: `kWh × (kgCO2e/kWh) = kgCO2e` 처럼 곱셈으로 단위 약분.
 * 음수 활동량이 들어와도 곱셈만 수행한다 (검증은 호출자 또는 입력 단계에서).
 *
 * @example
 * calculateEmission(110, 0.456) // 50.16
 *
 * @param amount  활동량
 * @param factor  단위당 배출계수 (kgCO2e/단위)
 * @returns       배출량 (kgCO2e)
 */
export function calculateEmission(amount: number, factor: number): number {
  return amount * factor;
}

/**
 * GHG Protocol Scope 분류.
 *
 * 본 과제 데이터 기준 매핑:
 * - 전기 → Scope 2 (구매한 전력)
 * - 원소재 → Scope 3 (업스트림 공급망)
 * - 운송 → Scope 3 (외주 물류)
 *
 * Scope 1(자체 시설·차량 직접 배출)에 해당하는 활동은 본 데이터에 없다.
 */
export function classifyByScope(
  activity: Pick<ActivityRecord, "type">,
): Scope {
  if (activity.type === "전기") return 2;
  return 3;
}

// ---------- 2. 계수 매칭 ----------

/**
 * 활동 1건에 적용할 배출계수를 찾는다.
 *
 * 매칭 규칙:
 *   1. `factor.type === activity.type`
 *   2. `factor.description === activity.description`
 *   3. `factor.validFrom ≤ activity.date < (factor.validTo ?? 무한대)`
 *
 * 여러 계수가 동시에 매칭되면 가장 최신 `validFrom` 을 가진 계수를 우선한다
 * (다음 버전이 valid 구간이 겹치도록 갱신될 수도 있어 안전 장치).
 *
 * 날짜 비교는 ISO 8601(yyyy-mm-dd) 문자열의 사전순 비교로 충분 — Date 객체 생성 없음.
 *
 * @example
 * matchFactor(
 *   { type: "전기", description: "한국전력", date: "2025-03-01", ... },
 *   factors
 * )
 * // → 한국전력 v1 (validFrom 2025-01-01) 계수 반환
 *
 * @returns 매칭되는 계수, 없으면 `undefined`
 */
export function matchFactor(
  activity: Pick<ActivityRecord, "type" | "description" | "date">,
  factors: EmissionFactor[],
): EmissionFactor | undefined {
  const candidates = factors.filter((f) => {
    if (f.type !== activity.type) return false;
    if (f.description !== activity.description) return false;
    if (activity.date < f.validFrom) return false;
    if (f.validTo !== undefined && activity.date >= f.validTo) return false;
    return true;
  });

  if (candidates.length === 0) return undefined;
  // 최신 validFrom 우선 (사전순 max)
  return candidates.reduce((latest, f) =>
    f.validFrom > latest.validFrom ? f : latest,
  );
}

// ---------- 3. 전체 활동 계산 ----------

/**
 * 활동 데이터 전체를 계산된 배출량으로 변환.
 *
 * 각 활동에 대해 계수를 찾아 곱하고, Scope 분류까지 부여해 `CalculatedEmission`을 만든다.
 * 매칭되는 계수가 없으면 즉시 throw — 데이터 정합성 오류는 조용히 무시하지 않는다.
 *
 * @throws  매칭되는 계수가 없을 때
 */
export function calculateEmissions(
  activities: ActivityRecord[],
  factors: EmissionFactor[],
): CalculatedEmission[] {
  return activities.map((a) => {
    const factor = matchFactor(a, factors);
    if (!factor) {
      throw new Error(
        `No matching factor for ${a.type}/${a.description} at ${a.date}`,
      );
    }
    return {
      productId: a.productId,
      date: a.date,
      type: a.type,
      description: a.description,
      amount: a.amount,
      activityUnit: a.unit,
      factor: factor.factor,
      factorVersion: factor.version,
      emission: calculateEmission(a.amount, factor.factor),
      scope: classifyByScope(a),
    };
  });
}

// ---------- 4. 집계 ----------

/**
 * 계산된 배출량 전체의 총합 (kgCO2e).
 *
 * Total PCF KPI의 기반.
 */
export function totalEmission(calculated: CalculatedEmission[]): number {
  return calculated.reduce((sum, e) => sum + e.emission, 0);
}

/**
 * 단계별 집계.
 *
 * 각 단계의 총 배출량 + 전체 대비 비율(share)을 계산.
 * 결과는 항상 `원소재 / 전기 / 운송` 3개 단계 모두 포함 (데이터가 0이어도 항목 존재).
 *
 * Lifecycle Donut, Top Lifecycle Stage 카드의 기반.
 */
export function aggregateByStage(
  calculated: CalculatedEmission[],
): StageAggregate[] {
  const stages: LifecycleStage[] = ["원소재", "전기", "운송"];
  const total = totalEmission(calculated);

  return stages.map((stage) => {
    const stageTotal = calculated
      .filter((e) => e.type === stage)
      .reduce((sum, e) => sum + e.emission, 0);
    return {
      stage,
      total: stageTotal,
      share: total === 0 ? 0 : stageTotal / total,
    };
  });
}

/**
 * 월별 집계.
 *
 * 날짜에서 "yyyy-mm" 키를 추출해 월별로 그룹화한 뒤,
 * 각 월의 총합 + 단계별 분해 + Scope별 분해를 계산.
 * 결과는 월 오름차순 정렬.
 *
 * 월별 PCF Bar, 월별 단계 적층 Bar의 기반.
 */
export function aggregateByMonth(
  calculated: CalculatedEmission[],
): MonthlyAggregate[] {
  // "yyyy-mm" → 해당 월의 항목들
  const groups = new Map<string, CalculatedEmission[]>();
  for (const e of calculated) {
    const month = e.date.slice(0, 7); // "2025-01-15" → "2025-01"
    const bucket = groups.get(month) ?? [];
    bucket.push(e);
    groups.set(month, bucket);
  }

  const months = Array.from(groups.keys()).sort(); // 사전순 = 시간순

  return months.map((month) => {
    const items = groups.get(month)!;
    const byStage: Record<LifecycleStage, number> = {
      원소재: 0,
      전기: 0,
      운송: 0,
    };
    const byScope: Record<Scope, number> = { 1: 0, 2: 0, 3: 0 };
    let total = 0;
    for (const e of items) {
      total += e.emission;
      byStage[e.type] += e.emission;
      byScope[e.scope] += e.emission;
    }
    return { month, total, byStage, byScope };
  });
}

/**
 * 월별 집계의 월 평균 배출량.
 *
 * 데이터에 존재하는 월의 평균 (월이 없으면 0).
 * Avg PCF KPI의 기반.
 */
export function averageMonthlyEmission(monthly: MonthlyAggregate[]): number {
  if (monthly.length === 0) return 0;
  const sum = monthly.reduce((acc, m) => acc + m.total, 0);
  return sum / monthly.length;
}

// ---------- 5. 인사이트 ----------

/**
 * 단계별 집계 중 총 배출량이 가장 큰 단계.
 *
 * Top Lifecycle Stage KPI의 기반.
 *
 * @returns 가장 큰 단계, 데이터가 비어 있으면 `null`
 */
export function topStage(stages: StageAggregate[]): StageAggregate | null {
  if (stages.length === 0) return null;
  return stages.reduce((max, s) => (s.total > max.total ? s : max));
}

/**
 * 단일 활동 중 배출량이 가장 큰 1건 (이상치·핵심 활동 탐지).
 *
 * Hotspot KPI의 기반.
 *
 * @returns 가장 큰 활동, 데이터가 비어 있으면 `null`
 */
export function hotspot(
  calculated: CalculatedEmission[],
): CalculatedEmission | null {
  if (calculated.length === 0) return null;
  return calculated.reduce((max, e) =>
    e.emission > max.emission ? e : max,
  );
}

// ---------- 6. 시나리오 ----------

/**
 * 감축 시나리오 적용 후 재계산.
 *
 * 각 활동의 `amount`에 `(1 − reductions[type])`을 곱한 뒤 동일한 계수로 재계산.
 * 본 과제의 단순화 모델 (DECISIONS의 감축 시나리오 모델).
 *
 * `reductions`에 없는 단계는 0(감축 없음)으로 간주.
 *
 * @example
 * applyScenario(activities, factors, { 원소재: 0, 전기: 0.2, 운송: 0 })
 * // → 전기 활동량을 80%로 줄여 재계산
 *
 * @returns 감축 적용된 CalculatedEmission[]
 */
export function applyScenario(
  activities: ActivityRecord[],
  factors: EmissionFactor[],
  reductions: ScenarioReductions,
): CalculatedEmission[] {
  const adjusted = activities.map((a) => ({
    ...a,
    amount: a.amount * (1 - (reductions[a.type] ?? 0)),
  }));
  return calculateEmissions(adjusted, factors);
}
