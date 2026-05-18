"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/common/ToastContext";
import { downloadBundle, restoreBundle, readFileAsText, type RestoreResult } from "@/lib/utils/backup";
import { Download, Upload, AlertTriangle, RotateCcw } from "lucide-react";

export default function BackupPage() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [lastResult, setLastResult] = useState<RestoreResult | null>(null);

  const handleExport = () => {
    downloadBundle();
    toast.success("백업 다운로드", "JSON 파일이 다운로드되었습니다");
  };

  const handleImportClick = () => {
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm(`'${file.name}' 백업을 복원하시겠습니까?\n현재 사용자 설정이 덮어쓰여집니다.`)) {
      e.target.value = "";
      return;
    }
    try {
      const text = await readFileAsText(file);
      const result = restoreBundle(text);
      setLastResult(result);
      if (result.ok) {
        toast.success("복원 완료", `${result.applied.length}개 키 복원됨 — 새로고침 후 적용`);
      } else {
        toast.warning("복원 실패", result.errors.join(", "));
      }
    } catch (err) {
      toast.warning("파일 읽기 실패", String(err));
    } finally {
      e.target.value = "";
    }
  };

  const handleClearAll = () => {
    if (!confirm("모든 사용자 설정(테마/즐겨찾기/알림 룰/감사 로그)을 초기화하시겠습니까?\n복구할 수 없습니다.")) return;
    if (typeof window !== "undefined") {
      [
        "sales-crm-theme",
        "sales-crm-favorites",
        "sales-crm-notif-read",
        "sales-crm-notif-rules",
        "sales-crm-audit-log",
      ].forEach((k) => window.localStorage.removeItem(k));
    }
    toast.warning("초기화 완료", "새로고침 후 기본값이 적용됩니다");
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          💾 데이터 백업 / 복원
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          브라우저에 저장된 사용자 설정을 JSON으로 백업하고 다른 기기에서 복원할 수 있습니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">백업 대상</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1.5 list-disc pl-5">
            <li>🎨 테마 설정 (라이트/다크/시스템)</li>
            <li>⭐ 즐겨찾기 고객사·딜</li>
            <li>🔔 알림 읽음 상태</li>
            <li>⚙️ 알림 룰 (임계일/토글)</li>
            <li>📜 감사 로그 (최근 500건)</li>
          </ul>
          <div className="mt-3 text-xs text-muted-foreground bg-muted/40 p-3 rounded">
            💡 고객사/딜/활동 등 핵심 데이터는 ELLIS 통합 후 서버에서 백업됩니다. 현재는 mock 메모리 상태로 새로고침 시 초기화됨.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">백업 / 복원</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExport} className="w-full sm:w-auto">
            <Download className="h-4 w-4" />JSON 백업 다운로드
          </Button>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleImportClick} variant="outline" className="w-full sm:w-auto">
              <Upload className="h-4 w-4" />JSON 파일에서 복원...
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {lastResult && (
            <div className={`rounded-md p-3 border text-sm space-y-1 ${
              lastResult.ok ? "bg-success/5 border-success/30" : "bg-destructive/5 border-destructive/30"
            }`}>
              <div className="font-medium">
                {lastResult.ok ? "✅ 복원 결과" : "❌ 복원 실패"}
              </div>
              {lastResult.applied.length > 0 && (
                <div className="text-xs">적용된 키: {lastResult.applied.join(", ")}</div>
              )}
              {lastResult.errors.length > 0 && (
                <ul className="text-xs text-destructive list-disc pl-4">
                  {lastResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                💡 복원 후 페이지를 새로고침해야 일부 변경사항이 반영됩니다.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />위험 구역
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleClearAll}>
            <RotateCcw className="h-4 w-4" />모든 사용자 설정 초기화
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            테마/즐겨찾기/알림 룰/감사 로그가 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
