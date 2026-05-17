"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/StateCards";
import { useToast } from "@/components/common/ToastContext";
import { useActivityWizard } from "@/components/crm/ActivityWizard";
import { MOCK_ACTIVITIES } from "@/lib/mock/activities";
import { useSalesVersion } from "@/lib/store/sales-store";
import { formatNumber, relativeTime } from "@/lib/utils/format";
import { generateCsv, downloadCsv } from "@/lib/utils/csv";
import { Plus, Calendar, Search, Download } from "lucide-react";

const ICON: Record<string, string> = {
  CALL: "📞", MEETING: "📅", EMAIL_LOG: "✉", MESSENGER: "💬",
  PROPOSAL_SENT: "📝", CONTRACT_SENT: "✍", NOTE: "🗒",
};

const TYPE_OPTIONS = [
  { value: "ALL",            label: "전체" },
  { value: "CALL",           label: "📞 통화" },
  { value: "MEETING",        label: "📅 미팅" },
  { value: "EMAIL_LOG",      label: "✉ 이메일" },
  { value: "MESSENGER",      label: "💬 메신저" },
  { value: "PROPOSAL_SENT",  label: "📝 견적" },
  { value: "CONTRACT_SENT",  label: "✍ 계약" },
  { value: "NOTE",           label: "🗒 메모" },
];

export default function ActivitiesPage() {
  const version = useSalesVersion();
  const toast = useToast();
  const wizard = useActivityWizard();
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("ALL");
  void version;

  const filtered = useMemo(() => {
    const arr = [...MOCK_ACTIVITIES].filter((a) => {
      if (type !== "ALL" && a.activityType !== type) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = [
          a.subject, a.content, a.outcome, a.nextAction,
          a.accountName, a.userName, a.dealName, a.contactName,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    arr.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    return arr;
  }, [q, type, version]);

  const exportCsv = () => {
    const csv = generateCsv(filtered, [
      { label: "ID",            get: (a) => a.id },
      { label: "유형",          get: (a) => a.activityType },
      { label: "담당",          get: (a) => a.userName },
      { label: "고객사",        get: (a) => a.accountName ?? "" },
      { label: "딜",            get: (a) => a.dealName ?? "" },
      { label: "담당자",         get: (a) => a.contactName ?? "" },
      { label: "발생 시각",      get: (a) => a.occurredAt },
      { label: "소요(분)",       get: (a) => a.durationMinutes ?? "" },
      { label: "제목",          get: (a) => a.subject ?? "" },
      { label: "내용",          get: (a) => a.content ?? "" },
      { label: "결과",          get: (a) => a.outcome ?? "" },
      { label: "다음 액션",      get: (a) => a.nextAction ?? "" },
    ]);
    const date = new Date().toISOString().split("T")[0];
    downloadCsv(`activities-${date}`, csv);
    toast.success("CSV 내보내기", `${filtered.length}건 활동 다운로드`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">활동 타임라인</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatNumber(filtered.length)}건
            {filtered.length !== MOCK_ACTIVITIES.length && ` / 전체 ${MOCK_ACTIVITIES.length}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />CSV ({filtered.length})
          </Button>
          <Button onClick={() => wizard.open()}><Plus className="h-4 w-4" />활동 기록</Button>
        </div>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="제목·내용·고객사·담당 검색..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">유형</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-10 w-10" />}
          title={q || type !== "ALL" ? "조건에 맞는 활동이 없습니다" : "아직 활동 기록이 없습니다"}
          description={q || type !== "ALL"
            ? "필터를 초기화하거나 다른 검색어를 시도해보세요."
            : "첫 번째 활동을 기록하고 고객 접점을 추적하세요."}
          action={
            q || type !== "ALL"
              ? { label: "필터 초기화", onClick: () => { setQ(""); setType("ALL"); } }
              : { label: "활동 기록하기", onClick: () => wizard.open() }
          }
        />
      ) : (
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map((a) => (
              <div key={a.id} className="p-4 hover:bg-accent/30 transition-colors">
                <div className="flex gap-3">
                  <div className="text-2xl">{ICON[a.activityType] ?? "•"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium">{a.userName}</span>
                      <span className="text-muted-foreground"> · </span>
                      <span className="text-muted-foreground">{relativeTime(a.occurredAt)}</span>
                      {a.durationMinutes && <span className="text-muted-foreground"> · {a.durationMinutes}분</span>}
                      {a.accountName && (
                        <>
                          <span className="text-muted-foreground"> · </span>
                          <span>{a.accountName}</span>
                        </>
                      )}
                    </div>
                    {a.subject && <div className="text-sm font-medium mt-1">{a.subject}</div>}
                    {a.content && <div className="text-sm text-muted-foreground mt-1">{a.content}</div>}
                    {a.outcome && (
                      <div className="text-xs mt-1.5">
                        <span className="text-muted-foreground">결과: </span>
                        {a.outcome}
                      </div>
                    )}
                    {a.nextAction && (
                      <div className="text-xs mt-1.5 text-primary">▶ 다음 액션: {a.nextAction}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
