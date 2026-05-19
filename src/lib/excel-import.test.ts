/**
 * excel-import.ts 테스트.
 *
 * XLSX.utils.aoa_to_sheet 으로 메모리에 엑셀 워크북을 만든 뒤
 * `write({ type: "array" })`로 ArrayBuffer를 얻어 parseActivities에 넣는 방식.
 * 파일 시스템 없이 도메인 명세를 검증한다.
 */

import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { parseActivities } from "@/lib/excel-import";

/** 2D 배열(행 × 셀)을 받아 ArrayBuffer로 변환하는 헬퍼. */
function buildBuffer(rows: unknown[][]): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" });
}

describe("parseActivities", () => {
  it("정상 엑셀을 ActivityRecord 배열로 변환한다", () => {
    const buffer = buildBuffer([
      ["일자(원본)", "활동 유형", "설명", "량", "단위"],
      ["2025-01-01", "전기", "한국전력", 110, "kWh"],
      ["2025-01-01", "원소재", "플라스틱 1", 230, "kg"],
    ]);
    const result = parseActivities(buffer, "CT-045");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.activities).toHaveLength(2);
      expect(result.activities[0]).toMatchObject({
        productId: "CT-045",
        type: "전기",
        description: "한국전력",
        amount: 110,
        unit: "kWh",
      });
      expect(result.activities[1]).toMatchObject({
        type: "원소재",
        description: "플라스틱 1",
        amount: 230,
        unit: "kg",
      });
    }
  });

  it("헤더가 A1이 아닌 다른 위치에 있어도 자동 감지한다", () => {
    // 과제 엑셀처럼 상단에 제목·안내문이 있는 형태
    const buffer = buildBuffer([
      ["원본 활동 데이터"],
      [""],
      ["일자(원본)", "활동 유형", "설명", "량", "단위"],
      ["2025-01-01", "전기", "한국전력", 110, "kWh"],
    ]);
    const result = parseActivities(buffer, "CT-045");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.activities).toHaveLength(1);
    }
  });

  it("키 헤더가 어디에도 없으면 명확한 에러를 반환한다", () => {
    const buffer = buildBuffer([
      ["다른헤더1", "다른헤더2"],
      ["a", "b"],
    ]);
    const result = parseActivities(buffer, "CT-045");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toContain("일자(원본)");
    }
  });

  it("활동 유형이 잘못되면 행 번호와 함께 에러 메시지를 반환한다", () => {
    const buffer = buildBuffer([
      ["일자(원본)", "활동 유형", "설명", "량", "단위"],
      ["2025-01-01", "잘못된유형", "한국전력", 110, "kWh"],
    ]);
    const result = parseActivities(buffer, "CT-045");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      // 헤더가 1행이면 데이터는 2행
      expect(result.errors[0]).toMatch(/행 2/);
      expect(result.errors[0]).toContain("활동 유형");
    }
  });

  it("음수 활동량은 에러", () => {
    const buffer = buildBuffer([
      ["일자(원본)", "활동 유형", "설명", "량", "단위"],
      ["2025-01-01", "전기", "한국전력", -10, "kWh"],
    ]);
    const result = parseActivities(buffer, "CT-045");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes("음수"))).toBe(true);
    }
  });

  it("허용되지 않은 단위는 에러", () => {
    const buffer = buildBuffer([
      ["일자(원본)", "활동 유형", "설명", "량", "단위"],
      ["2025-01-01", "전기", "한국전력", 110, "MWh"],
    ]);
    const result = parseActivities(buffer, "CT-045");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes("단위"))).toBe(true);
    }
  });

  it("모든 키 컬럼이 비어 있는 행은 skip한다", () => {
    const buffer = buildBuffer([
      ["일자(원본)", "활동 유형", "설명", "량", "단위"],
      ["2025-01-01", "전기", "한국전력", 110, "kWh"],
      [], // 빈 행
      ["2025-02-01", "전기", "한국전력", 112, "kWh"],
    ]);
    const result = parseActivities(buffer, "CT-045");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.activities).toHaveLength(2);
    }
  });

  it("여러 행에 걸친 에러는 한 번에 모두 모아 반환한다", () => {
    const buffer = buildBuffer([
      ["일자(원본)", "활동 유형", "설명", "량", "단위"],
      ["2025-01-01", "잘못된유형", "한국전력", 110, "kWh"],
      ["2025-02-01", "전기", "한국전력", -50, "MWh"],
    ]);
    const result = parseActivities(buffer, "CT-045");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      // 한 번에 다 보고 고칠 수 있도록 모든 에러 노출
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
      expect(result.errors.some((e) => e.match(/행 2/))).toBe(true);
      expect(result.errors.some((e) => e.match(/행 3/))).toBe(true);
    }
  });
});
