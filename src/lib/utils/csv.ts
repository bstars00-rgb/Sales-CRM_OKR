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
