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
 * 엑셀 파일을 ActivityRecord[]로 파싱.
 * productId는 엑셀에 없으므로 호출자가 지정.
 *
 * 이번 단계는 매핑만 — 잘못된 값이 들어와도 그대로 통과한다.
 * 검증은 후속 커밋에서 추가.
 */
export function parseActivities(
  buffer: ArrayBuffer,
  productId: string,
): ActivityRecord[] {
  const rows = parseSheetRaw(buffer);
  return rows.map((row) => mapRow(row, productId));
}
