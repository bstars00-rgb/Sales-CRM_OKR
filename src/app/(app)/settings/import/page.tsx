"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/common/ToastContext";
import { parseCsv } from "@/lib/utils/csv";
import { addAccounts } from "@/lib/store/sales-store";
import { readFileAsText } from "@/lib/utils/backup";
import type { Account, AccountGrade, AccountSegment, AccountStatus, RiskLevel } from "@/lib/mock/types";
import { Upload, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

type Phase = "idle" | "preview" | "done";

interface ParsedRow {
  raw: Record<string, string>;
  account?: Account;
  error?: string;
}

const REQUIRED_COLS = ["고객사명", "타입", "등급", "상태", "국가", "도시", "담당"];

const SEGMENT_MAP: Record<string, AccountSegment> = {
  HOTEL: "HOTEL", OTA: "OTA",
  TRAVEL_AGENCY: "TRAVEL_AGENCY", WHOLESALER: "WHOLESALER",
  DMC: "DMC", API_PARTNER: "API_PARTNER", OFFLINE_AGENT: "OFFLINE_AGENT",
};

const GRADE_MAP: Record<string, AccountGrade> = {
  KEY_ACCOUNT: "KEY_ACCOUNT", GROWTH: "GROWTH",
  NEW_PROSPECT: "NEW_PROSPECT", DORMANT: "DORMANT",
  LOW_POTENTIAL: "LOW_POTENTIAL",
  KEY: "KEY_ACCOUNT", NEW: "NEW_PROSPECT", LOW: "LOW_POTENTIAL",
};

const STATUS_MAP: Record<string, AccountStatus> = {
  PROSPECT: "PROSPECT", CONTACTED: "CONTACTED", MEETING_DONE: "MEETING_DONE",
  PROPOSAL_SENT: "PROPOSAL_SENT", CONTRACTING: "CONTRACTING",
  API_INTEGRATION: "API_INTEGRATION", ACTIVE: "ACTIVE",
  DORMANT: "DORMANT", LOST: "LOST",
};

export default function ImportPage() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [resultMsg, setResultMsg] = useState<string>("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        toast.warning("빈 파일", "CSV에 데이터가 없습니다");
        return;
      }
      // 필수 컬럼 검증
      const headers = Object.keys(parsed[0]);
      const missing = REQUIRED_COLS.filter((c) => !headers.includes(c));
      if (missing.length > 0) {
        toast.warning("컬럼 누락", `필수 컬럼이 없습니다: ${missing.join(", ")}`);
        return;
      }

      const validated = parsed.map((raw, idx) => validateRow(raw, idx));
      setRows(validated);
      setFileName(file.name);
      setPhase("preview");
    } catch (err) {
      toast.warning("파일 읽기 실패", String(err));
    } finally {
      e.target.value = "";
    }
  };

  const validRows = rows.filter((r) => r.account && !r.error);
  const errorRows = rows.filter((r) => r.error);

  const handleConfirm = () => {
    if (validRows.length === 0) {
      toast.warning("가져올 행 없음");
      return;
    }
    const result = addAccounts(validRows.map((r) => r.account!));
    setResultMsg(`✅ ${result.added}개 추가 · ${result.skipped}개 중복 스킵 · ${errorRows.length}개 검증 실패`);
    setPhase("done");
    toast.success("CSV 가져오기 완료", `${result.added}개 고객사 추가`);
  };

  const handleReset = () => {
    setRows([]);
    setPhase("idle");
    setFileName("");
    setResultMsg("");
  };

  const downloadTemplate = () => {
    const sampleRow = [
      "acc-new-001", "샘플 호텔 그룹", "OTA", "KEY_ACCOUNT", "ACTIVE",
      "VN", "베트남", "호치민", "user-mock-1", "김민수",
    ];
    const header = "ID,고객사명,타입,등급,상태,국가코드,국가,도시,담당ID,담당";
    const csv = "﻿" + header + "\n" + sampleRow.join(",");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "accounts-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          CSV 가져오기 (Account)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          엑셀에서 작성한 CSV로 고객사를 일괄 등록합니다. UTF-8 권장.
        </p>
      </div>

      {phase === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1단계 — 파일 선택</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" />CSV 파일 선택...
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <FileText className="h-4 w-4" />템플릿 다운로드
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1">
              <div className="font-medium">필수 컬럼</div>
              <div className="flex flex-wrap gap-1">
                {REQUIRED_COLS.map((c) => (
                  <Badge key={c} variant="muted" className="text-[10px]">{c}</Badge>
                ))}
              </div>
              <div className="text-muted-foreground mt-1">
                💡 ID·국가코드·담당ID는 선택 (없으면 자동 생성·매핑)
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "preview" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">2단계 — 미리보기 ({fileName})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Stat label="전체 행" value={rows.length} tone="muted" />
                <Stat label="✅ 유효" value={validRows.length} tone="success" />
                <Stat label="⚠ 오류" value={errorRows.length} tone="warning" />
              </div>

              <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-md">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 sticky top-0">
                    <tr className="text-left">
                      <th className="py-2 px-2 w-12">#</th>
                      <th className="py-2 px-2 w-20">상태</th>
                      <th className="py-2 px-2">고객사명</th>
                      <th className="py-2 px-2">타입</th>
                      <th className="py-2 px-2">등급</th>
                      <th className="py-2 px-2">국가</th>
                      <th className="py-2 px-2">담당</th>
                      <th className="py-2 px-2">오류</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-t hover:bg-accent/30">
                        <td className="py-1.5 px-2 text-muted-foreground tabular-nums">{i + 1}</td>
                        <td className="py-1.5 px-2">
                          {r.error
                            ? <Badge variant="destructive" className="text-[9px]"><AlertTriangle className="h-2.5 w-2.5" />오류</Badge>
                            : <Badge variant="success" className="text-[9px]"><CheckCircle2 className="h-2.5 w-2.5" />유효</Badge>}
                        </td>
                        <td className="py-1.5 px-2 font-medium">{r.raw["고객사명"] ?? "—"}</td>
                        <td className="py-1.5 px-2">{r.raw["타입"] ?? "—"}</td>
                        <td className="py-1.5 px-2">{r.raw["등급"] ?? "—"}</td>
                        <td className="py-1.5 px-2">{r.raw["국가"] ?? "—"}</td>
                        <td className="py-1.5 px-2">{r.raw["담당"] ?? "—"}</td>
                        <td className="py-1.5 px-2 text-destructive max-w-[200px] truncate" title={r.error}>{r.error ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 sticky bottom-4 bg-card border rounded-md p-3 shadow-md">
            <div className="text-xs text-muted-foreground flex-1 self-center">
              {validRows.length > 0 && `${validRows.length}개 행을 가져옵니다. `}
              {errorRows.length > 0 && `${errorRows.length}개 오류 행은 무시됩니다.`}
            </div>
            <Button variant="outline" onClick={handleReset}>취소</Button>
            <Button onClick={handleConfirm} disabled={validRows.length === 0}>
              <Upload className="h-4 w-4" />
              {validRows.length}개 가져오기
            </Button>
          </div>
        </>
      )}

      {phase === "done" && (
        <Card className="bg-success/5 border-success/30">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
            <div className="text-lg font-semibold">{resultMsg}</div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleReset}>다른 파일 가져오기</Button>
              <Button asChild>
                <a href="/Sales-CRM_OKR/crm/accounts">고객사 보기</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "muted" | "success" | "warning" }) {
  return (
    <div className={`rounded-md border p-3 ${
      tone === "success" ? "border-success/40 bg-success/5" :
      tone === "warning" ? "border-warning/40 bg-warning/5" : ""
    }`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function validateRow(raw: Record<string, string>, idx: number): ParsedRow {
  const errors: string[] = [];

  const name = raw["고객사명"]?.trim();
  if (!name) errors.push("고객사명 누락");

  const segmentRaw = raw["타입"]?.toUpperCase().trim() ?? "";
  const segment = SEGMENT_MAP[segmentRaw];
  if (!segment) errors.push(`알 수 없는 타입: ${segmentRaw}`);

  const gradeRaw = raw["등급"]?.toUpperCase().trim() ?? "";
  const grade = GRADE_MAP[gradeRaw];
  if (!grade) errors.push(`알 수 없는 등급: ${gradeRaw}`);

  const statusRaw = raw["상태"]?.toUpperCase().trim() ?? "PROSPECT";
  const status = STATUS_MAP[statusRaw] ?? "PROSPECT";

  if (errors.length > 0) return { raw, error: errors.join("; ") };

  const id = raw["ID"]?.trim() || `acc-import-${Date.now()}-${idx}`;
  const account: Account = {
    id,
    name: name!,
    segment: segment!,
    grade: grade!,
    status,
    countryCode: (raw["국가코드"] || raw["국가"] || "??").slice(0, 2).toUpperCase(),
    countryName: raw["국가"] || "—",
    city: raw["도시"] || "—",
    ownerUserId: raw["담당ID"] || "user-mock-1",
    ownerName: raw["담당"] || "—",
    lastActivityAt: new Date().toISOString(),
    revenue3M: Number(raw["3M 거래액"] || raw["3M 거래"] || 0),
    gp3M: Number(raw["3M GP"] || 0),
    pipelineAmount: Number(raw["파이프라인"] || 0),
    riskLevel: (raw["리스크"]?.toUpperCase() as RiskLevel) || "MID",
    growthPotential: (raw["성장 가능성"]?.toUpperCase() as RiskLevel) || "MID",
    totalRevenueYtd: Number(raw["YTD 거래액"] || 0),
    totalGpYtd: Number(raw["YTD GP"] || 0),
    firstContactDate: raw["첫 컨택"] || new Date().toISOString().split("T")[0],
  };
  return { raw, account };
}
