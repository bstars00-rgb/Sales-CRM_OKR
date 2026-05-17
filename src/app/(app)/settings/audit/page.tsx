"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/common/ToastContext";
import { useAuditLog, type AuditAction } from "@/lib/store/audit-log";
import { generateCsv, downloadCsv } from "@/lib/utils/csv";
import { relativeTime } from "@/lib/utils/format";
import { ScrollText, Search, Trash2, Download } from "lucide-react";

const ACTION_BADGE: Record<AuditAction, { label: string; tone: "default" | "destructive" | "warning" | "success" | "muted" | "secondary" }> = {
  ACTIVITY_ADD:    { label: "활동 기록",   tone: "default" },
  TASK_ADD:        { label: "태스크 추가", tone: "muted" },
  TASK_TOGGLE:     { label: "태스크 토글", tone: "muted" },
  TASK_DELETE:     { label: "태스크 삭제", tone: "destructive" },
  DEAL_UPDATE:     { label: "딜 수정",     tone: "secondary" },
  DEAL_STAGE_MOVE: { label: "단계 이동",   tone: "secondary" },
  DEAL_WON:        { label: "Win",         tone: "success" },
  DEAL_LOST:       { label: "Lost",        tone: "destructive" },
  C6_TOGGLE:       { label: "C6 토글",     tone: "warning" },
  C6_REPLACE:      { label: "C6 교체",     tone: "warning" },
};

export default function AuditLogPage() {
  const { entries, clear, count } = useAuditLog();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [actionFilter, setActionFilter] = useState<"ALL" | AuditAction>("ALL");

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (actionFilter !== "ALL" && e.action !== actionFilter) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = [e.summary, e.actorName, e.action, e.refType].join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [entries, q, actionFilter]);

  const exportCsv = () => {
    const csv = generateCsv(filtered, [
      { label: "시각",   get: (e) => e.ts },
      { label: "액션",   get: (e) => e.action },
      { label: "주체",   get: (e) => `${e.actorName} (${e.actorId})` },
      { label: "참조",   get: (e) => `${e.refType}/${e.refId}` },
      { label: "요약",   get: (e) => e.summary },
      { label: "메타",   get: (e) => e.meta ? JSON.stringify(e.meta) : "" },
    ]);
    const date = new Date().toISOString().split("T")[0];
    downloadCsv(`audit-${date}`, csv);
    toast.success("감사 로그 내보내기", `${filtered.length}건 다운로드`);
  };

  const handleClear = () => {
    if (!confirm("감사 로그 전체를 삭제하시겠습니까?")) return;
    clear();
    toast.warning("감사 로그 초기화");
  };

  const actionStats = useMemo(() => {
    const stats = new Map<AuditAction, number>();
    entries.forEach((e) => stats.set(e.action, (stats.get(e.action) ?? 0) + 1));
    return Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-primary" />
            감사 로그
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            총 {count.toLocaleString()}건 (최근 500건 보관) · 브라우저 로컬 저장
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />CSV ({filtered.length})
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear} disabled={count === 0}>
            <Trash2 className="h-4 w-4 text-destructive" />초기화
          </Button>
        </div>
      </div>

      {/* 액션별 통계 */}
      {actionStats.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-2">액션별 빈도</div>
            <div className="flex flex-wrap gap-2">
              {actionStats.map(([action, n]) => {
                const meta = ACTION_BADGE[action];
                return (
                  <button
                    key={action}
                    onClick={() => setActionFilter((cur) => (cur === action ? "ALL" : action))}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Badge variant={meta.tone}>
                      {meta.label} · {n}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 필터 */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="요약·주체 검색..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          {(actionFilter !== "ALL" || q) && (
            <Button variant="ghost" size="sm" onClick={() => { setActionFilter("ALL"); setQ(""); }}>
              필터 초기화
            </Button>
          )}
        </div>
      </Card>

      {/* 로그 리스트 */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              {count === 0
                ? "기록된 변경이 없습니다. 활동을 기록하거나 딜을 변경하면 여기 표시됩니다."
                : "조건에 맞는 로그가 없습니다."}
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((e) => {
                const meta = ACTION_BADGE[e.action];
                return (
                  <li key={e.id} className="p-3 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <Badge variant={meta.tone} className="shrink-0 text-[10px]">{meta.label}</Badge>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">{e.summary}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {e.actorName} · {relativeTime(e.ts)} · {e.refType}/{e.refId}
                        </div>
                        {e.meta && Object.keys(e.meta).length > 0 && (
                          <details className="text-xs mt-1">
                            <summary className="text-muted-foreground cursor-pointer hover:text-foreground">메타 데이터</summary>
                            <pre className="mt-1 p-2 rounded bg-muted/50 overflow-x-auto text-[11px]">
                              {JSON.stringify(e.meta, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
