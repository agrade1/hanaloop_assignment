/**
 * 엑셀(.xlsx) 활동 데이터 임포트.
 *
 * 원본 시트의 한글 컬럼을 도메인 타입(ActivityRecord)으로 매핑.
 * 검증은 아직 없고, 컬럼 이름 매칭과 타입 캐스팅만 수행.
 */

import * as XLSX from "xlsx";

import type {
  ActivityRecord,
  ActivityUnit,
  LifecycleStage,
} from "@/lib/types";

/** 엑셀 헤더와 도메인 필드 매핑 (과제 제공 엑셀 기준). */
const COLUMNS = {
  date: "일자(원본)",
  type: "활동 유형",
  description: "설명",
  amount: "량",
  unit: "단위",
} as const;

/**
 * 엑셀 파일(ArrayBuffer)을 받아 첫 시트의 행을 JSON 객체 배열로 반환.
 * 헤더 행은 자동으로 키로 인식된다.
 */
export function parseSheetRaw(buffer: ArrayBuffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
}

/**
 * 엑셀 행 1개를 ActivityRecord로 변환 (검증 없는 단순 매핑).
 */
function mapRow(
  row: Record<string, unknown>,
  productId: string,
): ActivityRecord {
  return {
    productId,
    date: String(row[COLUMNS.date] ?? ""),
    type: row[COLUMNS.type] as LifecycleStage,
    description: String(row[COLUMNS.description] ?? ""),
    amount: Number(row[COLUMNS.amount]),
    unit: row[COLUMNS.unit] as ActivityUnit,
  };
}

/**
 * 파싱 결과 타입.
 *
 * 성공이면 activities, 실패면 errors 배열로 분기.
 * 호출자가 한 곳에서 분기 처리하기 쉽도록 discriminated union 사용.
 */
export type ParseResult =
  | { ok: true; activities: ActivityRecord[] }
  | { ok: false; errors: string[] };

/**
 * 엑셀 파일을 ActivityRecord[]로 파싱.
 * productId는 엑셀에 없으므로 호출자가 지정한다.
 *
 * 검증 단계:
 *   1. 빈 시트 거부
 *   2. 필수 컬럼(헤더) 존재 여부
 *
 * 값 단위 검증(숫자·음수·유효 단위 등)은 후속 커밋에서 추가.
 */
export function parseActivities(
  buffer: ArrayBuffer,
  productId: string,
): ParseResult {
  const rows = parseSheetRaw(buffer);

  if (rows.length === 0) {
    return { ok: false, errors: ["엑셀 시트가 비어 있습니다."] };
  }

  // 헤더 검증 — 첫 행을 기준으로 필수 컬럼이 모두 있는지 확인
  const present = Object.keys(rows[0]);
  const missing = Object.values(COLUMNS).filter(
    (col) => !present.includes(col),
  );
  if (missing.length > 0) {
    return {
      ok: false,
      errors: [`필수 컬럼이 누락되었습니다: ${missing.join(", ")}`],
    };
  }

  return { ok: true, activities: rows.map((row) => mapRow(row, productId)) };
}
