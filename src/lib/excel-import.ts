/**
 * 엑셀(.xlsx) 활동 데이터 임포트.
 *
 * 과제 제공 엑셀은 다음 특성을 가지므로 단순 `sheet_to_json`으로는 안 된다:
 *   - 시트가 여러 개일 수 있음 (데이터 시트가 첫 번째가 아닐 수 있음)
 *   - 헤더가 A1이 아니라 다른 위치(A3 등)에서 시작
 *   - 같은 시트 안 다른 영역(예: G열)에 배출계수가 함께 들어있을 수 있음
 *   - 헤더 위 행에 제목·안내문이 있음
 *
 * 그래서 다음 흐름으로 처리한다:
 *   1. 모든 시트를 돌며 "일자(원본)" 헤더 셀을 찾는다 (키 셀 자동 감지)
 *   2. 그 셀이 헤더 시작점 → 오른쪽으로 5개 컬럼만 읽기 (옆 영역 자동 무시)
 *   3. 헤더 다음 행부터 시트 끝까지 데이터 범위로 잡고 `sheet_to_json`
 *   4. 모든 키 컬럼이 비어 있는 행은 skip (시트 끝 빈 행 대응)
 *   5. 각 행에 엑셀 행 번호를 부여해 에러 메시지에 "행 N: ..." 형식으로 표시
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

/** 키 헤더 셀 — 이 텍스트로 헤더 시작점을 자동 감지한다. */
const KEY_HEADER = COLUMNS.date;

/** 활동 데이터 컬럼 개수 (일자/활동 유형/설명/량/단위). */
const COLUMN_COUNT = 5;

/** 허용되는 활동 유형(생애주기 단계). */
const VALID_TYPES: readonly LifecycleStage[] = ["원소재", "전기", "운송"];

/** 허용되는 활동 단위. */
const VALID_UNITS: readonly ActivityUnit[] = ["kWh", "kg", "ton-km"];

/**
 * 파싱 결과 타입.
 *
 * 성공이면 `activities`, 실패면 `errors` 배열로 분기.
 * discriminated union으로 호출자가 한 곳에서 안전하게 분기 처리하게 한다.
 */
export type ParseResult =
  | { ok: true; activities: ActivityRecord[] }
  | { ok: false; errors: string[] };

/**
 * 시트 안에서 특정 텍스트를 가진 첫 셀의 주소를 찾는다.
 * 못 찾으면 `null`.
 *
 * 메타 키(`!ref` 등)는 건너뛴다.
 */
function findCellByText(
  sheet: XLSX.WorkSheet,
  text: string,
): string | null {
  for (const addr in sheet) {
    if (addr.startsWith("!")) continue;
    const cell = sheet[addr] as XLSX.CellObject;
    if (cell?.v === text) return addr;
  }
  return null;
}

/**
 * workbook에서 키 헤더("일자(원본)")가 있는 시트와 그 셀 위치를 찾는다.
 * 모든 시트를 돌며 첫 번째 매칭을 반환.
 */
function locateActivitySheet(
  workbook: XLSX.WorkBook,
): { sheet: XLSX.WorkSheet; headerAddress: string } | null {
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const addr = findCellByText(sheet, KEY_HEADER);
    if (addr) return { sheet, headerAddress: addr };
  }
  return null;
}

/**
 * 한 행이 활동 데이터로 볼 수 있는 행인지 검사 — 모든 키 컬럼이 비어 있으면 skip 대상.
 * 엑셀 끝부분 빈 행을 자연스럽게 거른다.
 */
function isEmptyRow(row: Record<string, unknown>): boolean {
  return Object.values(COLUMNS).every((col) => {
    const v = row[col];
    return v === undefined || v === null || String(v).trim() === "";
  });
}

/**
 * 행 1개의 값을 검증해 에러 메시지 배열을 반환.
 * 메시지에는 엑셀 행 번호(헤더 1행 포함)를 prefix로 붙인다.
 */
function validateRow(
  row: Record<string, unknown>,
  rowNumber: number,
): string[] {
  const errors: string[] = [];
  const at = `행 ${rowNumber}`;

  if (!row[COLUMNS.date]) {
    errors.push(`${at}: 일자가 비어 있습니다.`);
  }

  const type = row[COLUMNS.type];
  if (!VALID_TYPES.includes(type as LifecycleStage)) {
    errors.push(
      `${at}: 활동 유형이 올바르지 않습니다 — "${type}" (허용: ${VALID_TYPES.join(", ")})`,
    );
  }

  if (!row[COLUMNS.description]) {
    errors.push(`${at}: 설명이 비어 있습니다.`);
  }

  const amountRaw = row[COLUMNS.amount];
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount)) {
    errors.push(`${at}: 활동량이 숫자가 아닙니다 — "${amountRaw}"`);
  } else if (amount < 0) {
    errors.push(`${at}: 활동량이 음수입니다 — ${amount}`);
  }

  const unit = row[COLUMNS.unit];
  if (!VALID_UNITS.includes(unit as ActivityUnit)) {
    errors.push(
      `${at}: 단위가 올바르지 않습니다 — "${unit}" (허용: ${VALID_UNITS.join(", ")})`,
    );
  }

  return errors;
}

/**
 * 엑셀 행 1개를 ActivityRecord로 변환 (검증은 별도 함수에서 수행 가정).
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
 * productId는 엑셀에 없으므로 호출자가 지정한다.
 */
export function parseActivities(
  buffer: ArrayBuffer,
  productId: string,
): ParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });

  // 1. 키 헤더가 있는 시트 자동 감지
  const located = locateActivitySheet(workbook);
  if (!located) {
    return {
      ok: false,
      errors: [
        `"${KEY_HEADER}" 헤더가 있는 시트를 찾을 수 없습니다. 엑셀 형식을 확인해주세요.`,
      ],
    };
  }
  const { sheet, headerAddress } = located;
  const headerCell = XLSX.utils.decode_cell(headerAddress);

  // 2. 시트 전체 범위에서 헤더 행 ~ 끝 행까지 + 헤더 시작 컬럼부터 5개 컬럼만 추출
  const sheetRef = sheet["!ref"];
  if (!sheetRef) {
    return { ok: false, errors: ["시트 범위를 읽을 수 없습니다."] };
  }
  const sheetRange = XLSX.utils.decode_range(sheetRef);
  const targetRange = XLSX.utils.encode_range({
    s: { r: headerCell.r, c: headerCell.c },
    e: { r: sheetRange.e.r, c: headerCell.c + COLUMN_COUNT - 1 },
  });

  // 3. 그 범위만 sheet_to_json — 헤더 행을 자동으로 키로 사용
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    range: targetRange,
    defval: undefined,
  });

  // 4. 모든 키 컬럼이 빈 행은 제거 (시트 끝 빈 행 대응)
  const dataRows = rows.filter((row) => !isEmptyRow(row));

  if (dataRows.length === 0) {
    return {
      ok: false,
      errors: ["활동 데이터 행이 비어 있습니다."],
    };
  }

  // 5. 각 행 검증 — 엑셀 행 번호는 (헤더 row + 1-based index) + 1
  const errors: string[] = [];
  const headerRowNumber = headerCell.r + 1; // 0-base → 1-base 변환
  dataRows.forEach((row, idx) => {
    const excelRowNumber = headerRowNumber + idx + 1; // 헤더 다음 행부터
    errors.push(...validateRow(row, excelRowNumber));
  });
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    activities: dataRows.map((row) => mapRow(row, productId)),
  };
}
