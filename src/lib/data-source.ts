/**
 * DataSource 추상화 계층.
 *
 * UI·계산 모듈은 `DataSource` 인터페이스를 통해서만 데이터에 접근하며,
 * 구체 구현(`StaticDataSource`)에 직접 의존하지 않는다.
 * 이렇게 두면 향후 Postgres 또는 외부 API로 교체할 때
 * 동일 인터페이스를 구현하는 새 구현체만 추가하면 된다 (DECISIONS의 데이터 접근 추상화).
 *
 * 모든 메서드를 `Promise` 반환으로 둔 이유:
 * 정적 JSON에선 동기로 충분하지만, DB·API 구현체는 비동기이므로
 * 처음부터 비동기 시그니처로 통일해 교체 시 호출부 변경을 없앤다.
 */

import activitiesData from "@data/activities.json";
import emissionFactorsData from "@data/emission-factors.json";
import productsData from "@data/products.json";

import type {
  ActivityRecord,
  EmissionFactor,
  Product,
} from "@/lib/types";

/**
 * 데이터 접근 인터페이스.
 *
 * 도메인 메서드만 노출하고, 어떻게 가져오는지(JSON / DB / API)는 숨긴다.
 */
export interface DataSource {
  /** 제품 목록 */
  getProducts(): Promise<Product[]>;
  /** 활동 데이터 raw (중복 포함) */
  getActivities(): Promise<ActivityRecord[]>;
  /** 배출계수 목록 (버전·시점 정보 포함) */
  getEmissionFactors(): Promise<EmissionFactor[]>;
}

/**
 * 정적 JSON 기반 구현체.
 *
 * `data/*.json`을 빌드 타임에 import해서 메모리에 보유한다.
 * 비동기처럼 보이지만 실제로는 즉시 resolve.
 *
 * TypeScript의 JSON import는 union literal까지 보존하지 못하므로
 * (예: "원소재" → string) 명시적 캐스팅이 필요하다.
 * 데이터의 정합성은 시드 생성 시점에 사람이 보장한다고 가정.
 */
export const staticDataSource: DataSource = {
  async getProducts() {
    return productsData as Product[];
  },
  async getActivities() {
    return activitiesData as ActivityRecord[];
  },
  async getEmissionFactors() {
    return emissionFactorsData as EmissionFactor[];
  },
};
