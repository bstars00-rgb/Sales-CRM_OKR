/**
 * 백업 / 복원 — 브라우저 localStorage에 저장된 사용자 상태를 JSON으로 export/import.
 *
 * 대상:
 * - sales-crm-theme (다크모드 설정)
 * - sales-crm-favorites (즐겨찾기)
 * - sales-crm-notif-read (읽음 상태)
 * - sales-crm-notif-rules (알림 룰)
 * - sales-crm-audit-log (감사 로그)
 *
 * MOCK_* 배열은 메모리 mutate라서 새로고침 시 초기화되므로 백업 대상 외.
 * ELLIS 연동 후 진짜 백업은 서버 측 처리.
 */

const BACKUP_KEYS = [
  "sales-crm-theme",
  "sales-crm-favorites",
  "sales-crm-notif-read",
  "sales-crm-notif-rules",
  "sales-crm-audit-log",
] as const;

export interface BackupBundle {
  version: 1;
  exportedAt: string;
  app: "sales-crm-okr";
  data: Record<string, string>;
}

export function exportBundle(): BackupBundle {
  const data: Record<string, string> = {};
  if (typeof window !== "undefined") {
    for (const key of BACKUP_KEYS) {
      const v = window.localStorage.getItem(key);
      if (v !== null) data[key] = v;
    }
  }
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: "sales-crm-okr",
    data,
  };
}

export function downloadBundle(): void {
  if (typeof window === "undefined") return;
  const bundle = exportBundle();
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `sales-crm-backup-${date}.json`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface RestoreResult {
  ok: boolean;
  applied: string[];
  errors: string[];
}

export function restoreBundle(jsonText: string): RestoreResult {
  const result: RestoreResult = { ok: false, applied: [], errors: [] };
  if (typeof window === "undefined") {
    result.errors.push("브라우저 환경에서만 동작합니다");
    return result;
  }

  let parsed: BackupBundle;
  try {
    parsed = JSON.parse(jsonText) as BackupBundle;
  } catch (e) {
    result.errors.push("JSON 파싱 실패: " + String(e));
    return result;
  }

  if (parsed.app !== "sales-crm-okr") {
    result.errors.push(`다른 앱 백업입니다 (app=${parsed.app})`);
    return result;
  }
  if (parsed.version !== 1) {
    result.errors.push(`지원하지 않는 버전 (v${parsed.version})`);
    return result;
  }

  for (const [key, value] of Object.entries(parsed.data)) {
    if (!(BACKUP_KEYS as readonly string[]).includes(key)) {
      result.errors.push(`알 수 없는 키 무시: ${key}`);
      continue;
    }
    try {
      window.localStorage.setItem(key, value);
      result.applied.push(key);
    } catch (e) {
      result.errors.push(`${key} 저장 실패: ${String(e)}`);
    }
  }

  result.ok = result.applied.length > 0;
  return result;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("FileReader error"));
    reader.readAsText(file, "utf-8");
  });
}
