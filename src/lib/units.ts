/**
 * 단위 포맷 유틸.
 *
 * 내부 데이터·계산에선 ASCII 단위(`kgCO2e`)를 사용하고,
 * UI 표시 시 유니코드 첨자(`kgCO₂e`)로 변환하는 책임을 한 곳에 모은다.
 * 또한 값이 큰 경우 `kg → t` 자동 변환과 천 단위 구분자도 처리.
 *
 * DECISIONS의 "단위 표시 정책"을 이 모듈이 단일 진입점으로 구현한다.
 */

import type { ActivityUnit } from "@/lib/types";

/**
 * `kg → t` 자동 변환 임계값.
 *
 * 1,000 kgCO2e 이상이면 자릿수가 많아 가독성이 떨어지므로 `tCO2e`로 표시한다.
 * 예: 1500 kgCO2e → "1.5 tCO₂e"
 */
const T_THRESHOLD = 1000;

/**
 * 일관된 숫자 포맷 (천 단위 구분자, 자릿수 제어).
 *
 * 예: 1234.567, 2 → "1,234.57"
 * 예: 50.1611, 1 → "50.2"
 *
 * @param value          포맷할 숫자
 * @param fractionDigits 소수점 자릿수 (기본 2)
 */
export function formatNumber(value: number, fractionDigits: number = 2): string {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * 배출량을 표시용 문자열로 변환.
 *
 * 값이 임계값(1,000) 이상이면 `tCO₂e`로 변환, 미만이면 `kgCO₂e`로 유지.
 * 천 단위 구분자와 소수점이 자동 적용된다.
 *
 * @example
 * formatEmission(50.16)    // "50.16 kgCO₂e"
 * formatEmission(1508.8)   // "1.51 tCO₂e"
 * formatEmission(0)        // "0 kgCO₂e"
 *
 * @param value           kgCO2e 단위의 숫자
 * @param fractionDigits  소수점 자릿수 (기본 2)
 */
export function formatEmission(
  value: number,
  fractionDigits: number = 2,
): string {
  if (Math.abs(value) >= T_THRESHOLD) {
    const inTons = value / 1000;
    return `${formatNumber(inTons, fractionDigits)} tCO₂e`;
  }
  return `${formatNumber(value, fractionDigits)} kgCO₂e`;
}

/**
 * 활동 단위를 표시용 문자열로 변환.
 *
 * 본 과제 데이터의 활동 단위(`kWh`, `kg`, `ton-km`)는 ASCII 그대로 사용하지만,
 * `ton-km` 같은 일부 단위는 `ton·km`로 보여주는 게 시각적으로 깔끔.
 *
 * @example
 * formatActivityUnit("kWh")    // "kWh"
 * formatActivityUnit("kg")     // "kg"
 * formatActivityUnit("ton-km") // "ton·km"
 */
export function formatActivityUnit(unit: ActivityUnit): string {
  if (unit === "ton-km") return "ton·km";
  return unit;
}

/**
 * 배출계수의 단위 문자열(예: "kgCO2e/kWh")을 표시용으로 변환.
 *
 * ASCII로 저장된 `CO2e`를 유니코드 `CO₂e`로 치환.
 * 활동 단위에 하이픈이 있으면 가운뎃점으로 치환(`ton-km` → `ton·km`).
 *
 * @example
 * toDisplayFactorUnit("kgCO2e/kWh")     // "kgCO₂e/kWh"
 * toDisplayFactorUnit("kgCO2e/ton-km")  // "kgCO₂e/ton·km"
 */
export function toDisplayFactorUnit(rawUnit: string): string {
  return rawUnit.replace("CO2e", "CO₂e").replace("ton-km", "ton·km");
}

/**
 * 값에 따라 `kgCO₂e ↔ tCO₂e`를 자동 선택하면서,
 * 숫자 문자열과 단위를 **분리해** 반환한다.
 *
 * `formatEmission`은 한 문자열로 합쳐 주지만,
 * `KpiCard`처럼 값과 단위를 별도 시각 요소로 표시하는 곳에서는 분리된 형태가 필요.
 *
 * @example
 * splitEmission(773.732)    // { value: "773.7", unit: "kgCO₂e" }
 * splitEmission(1508.8)     // { value: "1.5",   unit: "tCO₂e" }
 */
export function splitEmission(
  value: number,
  fractionDigits: number = 1,
): { value: string; unit: string } {
  if (Math.abs(value) >= T_THRESHOLD) {
    return {
      value: formatNumber(value / 1000, fractionDigits),
      unit: "tCO₂e",
    };
  }
  return { value: formatNumber(value, fractionDigits), unit: "kgCO₂e" };
}

/**
 * 절감 효과를 "절감량 + 절감 비율" 형태로 표시.
 *
 * @example
 * formatReduction(100, 80)
 * // "20.00 kgCO₂e (20.0%)"
 *
 * @param before  감축 전 배출량 (kgCO2e)
 * @param after   감축 후 배출량 (kgCO2e)
 */
export function formatReduction(before: number, after: number): string {
  const delta = before - after;
  const pct = before === 0 ? 0 : (delta / before) * 100;
  return `${formatEmission(delta)} (${formatNumber(pct, 1)}%)`;
}
