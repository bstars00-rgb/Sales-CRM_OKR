/**
 * CSV 내보내기 유틸 — 외부 의존성 없이 브라우저에서 다운로드.
 */

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // 콤마, 따옴표, 줄바꿈 포함 시 따옴표로 감싸고 내부 따옴표는 이스케이프
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface CsvColumn<T> {
  label: string;
  get: (row: T) => unknown;
}

export function generateCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCsvCell(c.get(row))).join(","))
    .join("\n");
  // UTF-8 BOM 추가 — 엑셀에서 한글 깨짐 방지
  return "﻿" + header + "\n" + body;
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 간단한 CSV 파서 — UTF-8 BOM 제거, 따옴표 + 콤마 + 줄바꿈 처리.
 * 첫 행은 헤더. 결과는 헤더 키로 매핑된 객체 배열.
 */
export function parseCsv(text: string): Record<string, string>[] {
  // BOM 제거
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        cur.push(field); field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        cur.push(field); field = "";
        // 빈 줄은 건너뛰기
        if (cur.length > 1 || cur[0] !== "") rows.push(cur);
        cur = [];
      } else {
        field += c;
      }
    }
  }
  if (field !== "" || cur.length > 0) {
    cur.push(field);
    if (cur.length > 1 || cur[0] !== "") rows.push(cur);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (row[i] ?? "").trim(); });
    return obj;
  });
}
