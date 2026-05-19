/**
 * 엑셀(.xlsx) 활동 데이터 임포트.
 *
 * 일단 첫 번째 시트를 JSON 배열로 변환하는 가장 단순한 형태.
 * 컬럼 매핑·검증은 후속 단계에서 추가한다.
 */

import * as XLSX from "xlsx";

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
