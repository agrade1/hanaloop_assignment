/**
 * 도메인 타입 정의.
 *
 * 본 과제 데이터(CT-045 컴퓨터 화면)를 기반으로 PCF(Product Carbon Footprint)
 * 계산에 필요한 핵심 타입을 모은 모듈.
 *
 * 데이터(activities.json, emission-factors.json)의 한글 필드값을
 * 그대로 union literal로 사용해 변환 비용을 없앤다.
 */

/** 제품 — 본 과제는 CT-045 단일 제품 */
export type Product = {
  /** 제품 식별자 (예: "CT-045") */
  id: string;
  /** 표시 이름 (예: "컴퓨터 화면") */
  name: string;
};

/**
 * 생애주기 단계.
 *
 * 본 과제는 ISO 14067의 5단계(원자재→제조→유통→사용→폐기)를
 * 데이터가 존재하는 3단계로 단순화:
 * - 원소재 (Raw Material) — 자재 생산
 * - 전기 (Electricity) — 제조 시 사용 전력
 * - 운송 (Transport) — 유통/물류
 *
 * 사용·폐기 단계는 본 과제 데이터에 없어 생략.
 */
export type LifecycleStage = "원소재" | "전기" | "운송";

/**
 * GHG Protocol Scope 분류.
 *
 * - 1 = 직접 배출 (회사 시설·차량에서 직접 연소·배출)
 * - 2 = 구매한 에너지의 간접 배출 (전기, 열, 증기)
 * - 3 = 그 외 모든 간접 배출 (공급망, 운송, 출장 등)
 *
 * 숫자 union으로 둔 이유: 표시 시 "Scope 1" 등으로 매핑하기 좋고
 * 정렬·비교가 자연스러움.
 */
export type Scope = 1 | 2 | 3;

/**
 * 활동 단위.
 *
 * 본 과제 데이터에 등장하는 단위만 union으로 표현.
 * 향후 단위가 늘어나면 union을 확장한다.
 */
export type ActivityUnit = "kWh" | "kg" | "ton-km";

/**
 * 활동 데이터 1건 (raw).
 *
 * 엑셀 또는 시드 JSON의 한 행을 그대로 옮긴 형태.
 * 같은 날짜·(type, description) 조합이 여러 건 있을 수 있다 (중복 보존 — DECISIONS).
 */
export type ActivityRecord = {
  /** 어느 제품의 활동인지 */
  productId: string;
  /** 활동 발생일 (ISO yyyy-mm-dd) */
  date: string;
  /** 생애주기 단계 (활동 유형) */
  type: LifecycleStage;
  /** 단계 내 세부 활동 — "한국전력" / "플라스틱 1" / "트럭" 등 */
  description: string;
  /** 활동량 (음수가 아닌 숫자) */
  amount: number;
  /** 활동 단위 */
  unit: ActivityUnit;
};

/**
 * 배출계수 1건.
 *
 * 활동량을 배출량(kgCO2e)으로 환산하는 표준값.
 * 같은 (type, description) 조합이라도 시점에 따라 다른 버전이 존재할 수 있어,
 * `validFrom`/`validTo`로 시점 매칭이 가능하게 설계 (DECISIONS의 버전 관리).
 */
export type EmissionFactor = {
  /** 매칭 키 — 생애주기 단계 */
  type: LifecycleStage;
  /** 매칭 키 — 세부 활동 (활동 description과 일치해야 매칭됨) */
  description: string;
  /** 계수 값 — 활동 단위당 kgCO2e */
  factor: number;
  /** 표시용 단위 문자열 (예: "kgCO2e/kWh") */
  factorUnit: string;
  /** 매칭 대상이 되는 활동 단위 (활동 unit과 일치해야 정합) */
  activityUnit: ActivityUnit;
  /** 계수의 버전 일련번호 (관리·이력 추적용) */
  version: number;
  /** 이 계수가 유효해지는 시점 (ISO yyyy-mm-dd) */
  validFrom: string;
  /** 이 계수가 만료되는 시점 (없으면 현재까지 유효) */
  validTo?: string;
  /** 부가 설명 (예: "한국전력 기본값") */
  note?: string;
};

/**
 * 활동 1건에 배출계수를 적용해 계산된 결과.
 *
 * 원본 활동 정보를 유지(감사·추적성)하면서,
 * 적용된 계수·버전·계산값·Scope 분류를 함께 보관.
 */
export type CalculatedEmission = {
  // 원본 활동 식별 ----
  productId: string;
  date: string;
  type: LifecycleStage;
  description: string;
  // 원본 활동량 ----
  amount: number;
  activityUnit: ActivityUnit;
  // 적용된 계수 (어느 버전을 썼는지 보존) ----
  factor: number;
  factorVersion: number;
  // 결과 ----
  /** 계산된 배출량 (kgCO2e) — `amount × factor` */
  emission: number;
  /** GHG Scope 분류 */
  scope: Scope;
};

/**
 * 시나리오 감축률.
 *
 * 단계별 0~1 사이의 비율 (0.2 = 20% 감축).
 * 활동량에 `(1 - reduction)`을 곱하는 방식으로 적용 (DECISIONS의 감축 모델).
 */
export type ScenarioReductions = Record<LifecycleStage, number>;

/**
 * 월별 집계 결과.
 *
 * 한 달치 모든 활동의 배출량 합산 + 단계별·Scope별 분해.
 */
export type MonthlyAggregate = {
  /** "yyyy-mm" 형식 (예: "2025-05") */
  month: string;
  /** 해당 월의 총 배출량 (kgCO2e) */
  total: number;
  /** 단계별 합산 — 키가 없는 단계는 0 */
  byStage: Record<LifecycleStage, number>;
  /** Scope별 합산 — 키가 없는 Scope는 0 */
  byScope: Record<Scope, number>;
};

/**
 * 단계별 집계 결과.
 *
 * Lifecycle Donut / Top Lifecycle Stage 카드에서 사용.
 */
export type StageAggregate = {
  stage: LifecycleStage;
  /** 단계 총 배출량 (kgCO2e) */
  total: number;
  /** 전체 대비 비율 (0~1) — 예: 0.67 = 67% */
  share: number;
};
