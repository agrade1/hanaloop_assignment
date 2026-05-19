/**
 * src/lib/calc.ts 테스트.
 *
 * 각 함수가 도메인 명세에 따라 동작하는지 검증한다.
 * 부동소수점 오차를 고려해 등치 비교 대신 `toBeCloseTo`를 사용.
 *
 * 실행: `yarn test` (한 번 실행) / `yarn test:watch` (감시 모드)
 */

import { describe, expect, it } from "vitest";

import {
  aggregateByMonth,
  aggregateByStage,
  applyScenario,
  averageMonthlyEmission,
  calculateEmission,
  calculateEmissions,
  classifyByScope,
  hotspot,
  matchFactor,
  topStage,
  totalEmission,
} from "@/lib/calc";
import type {
  ActivityRecord,
  CalculatedEmission,
  EmissionFactor,
} from "@/lib/types";

// ---------- 공용 테스트 데이터 ----------

const factors: EmissionFactor[] = [
  {
    type: "전기",
    description: "한국전력",
    factor: 0.456,
    factorUnit: "kgCO2e/kWh",
    activityUnit: "kWh",
    version: 1,
    validFrom: "2025-01-01",
  },
  {
    // 이전 한국전력 계수가 2026년부터 갱신된다는 가정 — 시점 매칭 테스트용
    type: "전기",
    description: "한국전력",
    factor: 0.42,
    factorUnit: "kgCO2e/kWh",
    activityUnit: "kWh",
    version: 2,
    validFrom: "2026-01-01",
  },
  {
    type: "원소재",
    description: "플라스틱 1",
    factor: 2.3,
    factorUnit: "kgCO2e/kg",
    activityUnit: "kg",
    version: 1,
    validFrom: "2025-01-01",
  },
  {
    type: "운송",
    description: "트럭",
    factor: 3.5,
    factorUnit: "kgCO2e/ton-km",
    activityUnit: "ton-km",
    version: 1,
    validFrom: "2025-01-01",
  },
];

const activities: ActivityRecord[] = [
  // 2025-01
  { productId: "CT-045", date: "2025-01-01", type: "전기", description: "한국전력", amount: 110, unit: "kWh" },
  { productId: "CT-045", date: "2025-01-01", type: "원소재", description: "플라스틱 1", amount: 230, unit: "kg" },
  { productId: "CT-045", date: "2025-01-01", type: "운송", description: "트럭", amount: 41, unit: "ton-km" },
  // 2025-02
  { productId: "CT-045", date: "2025-02-01", type: "전기", description: "한국전력", amount: 112, unit: "kWh" },
];

// ---------- 1. 단일 값 계산 ----------

describe("calculateEmission", () => {
  it("활동량 × 계수를 반환한다", () => {
    expect(calculateEmission(110, 0.456)).toBeCloseTo(50.16, 5);
  });

  it("활동량이 0이면 0을 반환한다", () => {
    expect(calculateEmission(0, 0.456)).toBe(0);
  });

  it("계수가 0이면 0을 반환한다", () => {
    expect(calculateEmission(100, 0)).toBe(0);
  });
});

describe("classifyByScope", () => {
  it("전기는 Scope 2", () => {
    expect(classifyByScope({ type: "전기" })).toBe(2);
  });

  it("원소재는 Scope 3", () => {
    expect(classifyByScope({ type: "원소재" })).toBe(3);
  });

  it("운송은 Scope 3", () => {
    expect(classifyByScope({ type: "운송" })).toBe(3);
  });
});

// ---------- 2. 계수 매칭 ----------

describe("matchFactor", () => {
  it("type · description · 시점이 모두 맞으면 매칭된다", () => {
    const result = matchFactor(
      { type: "전기", description: "한국전력", date: "2025-03-01" },
      factors,
    );
    expect(result?.version).toBe(1);
    expect(result?.factor).toBe(0.456);
  });

  it("여러 버전이 매칭되면 최신 validFrom을 우선한다", () => {
    const result = matchFactor(
      { type: "전기", description: "한국전력", date: "2026-06-01" },
      factors,
    );
    expect(result?.version).toBe(2);
    expect(result?.factor).toBe(0.42);
  });

  it("validFrom 이전 시점은 매칭되지 않는다", () => {
    const result = matchFactor(
      { type: "전기", description: "한국전력", date: "2024-12-31" },
      factors,
    );
    expect(result).toBeUndefined();
  });

  it("description이 다르면 매칭되지 않는다", () => {
    const result = matchFactor(
      { type: "전기", description: "민영 전력", date: "2025-03-01" },
      factors,
    );
    expect(result).toBeUndefined();
  });

  it("type이 다르면 매칭되지 않는다", () => {
    const result = matchFactor(
      { type: "운송", description: "한국전력", date: "2025-03-01" },
      factors,
    );
    expect(result).toBeUndefined();
  });
});

// ---------- 3. 전체 계산 ----------

describe("calculateEmissions", () => {
  it("각 활동을 CalculatedEmission으로 변환한다", () => {
    const result = calculateEmissions(activities, factors);
    expect(result).toHaveLength(4);
    expect(result[0].emission).toBeCloseTo(50.16, 5); // 110 × 0.456
    expect(result[1].emission).toBeCloseTo(529, 5); // 230 × 2.3
    expect(result[2].emission).toBeCloseTo(143.5, 5); // 41 × 3.5
  });

  it("Scope 분류를 함께 부여한다", () => {
    const result = calculateEmissions(activities, factors);
    expect(result[0].scope).toBe(2); // 전기
    expect(result[1].scope).toBe(3); // 원소재
    expect(result[2].scope).toBe(3); // 운송
  });

  it("매칭되는 계수가 없으면 throw한다", () => {
    const bad: ActivityRecord[] = [
      { productId: "CT-045", date: "2025-01-01", type: "전기", description: "민영 전력", amount: 100, unit: "kWh" },
    ];
    expect(() => calculateEmissions(bad, factors)).toThrow(/No matching factor/);
  });
});

// ---------- 4. 집계 ----------

describe("totalEmission", () => {
  it("모든 배출량의 합을 반환한다", () => {
    const result = calculateEmissions(activities, factors);
    // 50.16 + 529 + 143.5 + 51.072 = 773.732
    expect(totalEmission(result)).toBeCloseTo(773.732, 3);
  });

  it("빈 배열이면 0", () => {
    expect(totalEmission([])).toBe(0);
  });
});

describe("aggregateByStage", () => {
  it("단계별 총합과 비율을 계산한다", () => {
    const calculated = calculateEmissions(activities, factors);
    const stages = aggregateByStage(calculated);
    const material = stages.find((s) => s.stage === "원소재");
    const electric = stages.find((s) => s.stage === "전기");
    const transport = stages.find((s) => s.stage === "운송");

    expect(material?.total).toBeCloseTo(529, 3);
    expect(electric?.total).toBeCloseTo(101.232, 3); // 50.16 + 51.072
    expect(transport?.total).toBeCloseTo(143.5, 3);

    // share 합은 1
    const sum = stages.reduce((acc, s) => acc + s.share, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("데이터가 없어도 3개 단계가 모두 포함된다 (값 0)", () => {
    const stages = aggregateByStage([]);
    expect(stages).toHaveLength(3);
    expect(stages.every((s) => s.total === 0 && s.share === 0)).toBe(true);
  });
});

describe("aggregateByMonth", () => {
  it("월별로 그룹화하고 오름차순 정렬한다", () => {
    const calculated = calculateEmissions(activities, factors);
    const monthly = aggregateByMonth(calculated);
    expect(monthly.map((m) => m.month)).toEqual(["2025-01", "2025-02"]);
  });

  it("각 월의 단계별·Scope별 분해를 계산한다", () => {
    const calculated = calculateEmissions(activities, factors);
    const monthly = aggregateByMonth(calculated);
    const jan = monthly.find((m) => m.month === "2025-01")!;

    expect(jan.byStage["원소재"]).toBeCloseTo(529, 3);
    expect(jan.byStage["전기"]).toBeCloseTo(50.16, 3);
    expect(jan.byStage["운송"]).toBeCloseTo(143.5, 3);

    expect(jan.byScope[2]).toBeCloseTo(50.16, 3); // 전기
    expect(jan.byScope[3]).toBeCloseTo(529 + 143.5, 3); // 원소재 + 운송
    expect(jan.byScope[1]).toBe(0); // 본 데이터에 Scope 1 없음
  });
});

describe("averageMonthlyEmission", () => {
  it("월별 총합의 산술 평균", () => {
    const calculated = calculateEmissions(activities, factors);
    const monthly = aggregateByMonth(calculated);
    const expected =
      monthly.reduce((acc, m) => acc + m.total, 0) / monthly.length;
    expect(averageMonthlyEmission(monthly)).toBeCloseTo(expected, 5);
  });

  it("월별 데이터가 비어 있으면 0", () => {
    expect(averageMonthlyEmission([])).toBe(0);
  });
});

// ---------- 5. 인사이트 ----------

describe("topStage", () => {
  it("총 배출량이 가장 큰 단계를 반환한다", () => {
    const calculated = calculateEmissions(activities, factors);
    const stages = aggregateByStage(calculated);
    expect(topStage(stages)?.stage).toBe("원소재"); // 529가 가장 큼
  });

  it("빈 배열이면 null", () => {
    expect(topStage([])).toBeNull();
  });
});

describe("hotspot", () => {
  it("단일 활동 중 배출량이 가장 큰 1건을 반환한다", () => {
    const calculated = calculateEmissions(activities, factors);
    const top = hotspot(calculated);
    expect(top?.description).toBe("플라스틱 1"); // 529가 가장 큼
  });

  it("빈 배열이면 null", () => {
    expect(hotspot([])).toBeNull();
  });
});

// ---------- 6. 시나리오 ----------

describe("applyScenario", () => {
  it("감축률 0이면 원본과 동일한 결과", () => {
    const original = calculateEmissions(activities, factors);
    const scenario = applyScenario(activities, factors, {
      원소재: 0,
      전기: 0,
      운송: 0,
    });
    expect(totalEmission(scenario)).toBeCloseTo(totalEmission(original), 5);
  });

  it("단계별 다른 감축률을 적용한다", () => {
    const scenario = applyScenario(activities, factors, {
      원소재: 0.3, // 30% 감축
      전기: 0.2, // 20% 감축
      운송: 0, // 그대로
    });

    const findOne = (
      type: string,
      date: string,
    ): CalculatedEmission | undefined =>
      scenario.find((e) => e.type === type && e.date === date);

    // 2025-01 전기: 110 × 0.8 × 0.456 = 40.128
    expect(findOne("전기", "2025-01-01")?.emission).toBeCloseTo(40.128, 3);
    // 2025-01 원소재: 230 × 0.7 × 2.3 = 370.3
    expect(findOne("원소재", "2025-01-01")?.emission).toBeCloseTo(370.3, 3);
    // 2025-01 운송: 41 × 1 × 3.5 = 143.5 (변화 없음)
    expect(findOne("운송", "2025-01-01")?.emission).toBeCloseTo(143.5, 3);
  });

  it("100% 감축이면 모든 배출량이 0", () => {
    const scenario = applyScenario(activities, factors, {
      원소재: 1,
      전기: 1,
      운송: 1,
    });
    expect(totalEmission(scenario)).toBe(0);
  });
});
