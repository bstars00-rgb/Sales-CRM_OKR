"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/StateCards";
import { useToast } from "@/components/common/ToastContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Sparkles, FileText, Pin, PinOff, Trash2, Plus, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { relativeTime } from "@/lib/utils/format";

export type MemoKind = "RISK" | "OPPORTUNITY" | "STRATEGY" | "GENERAL";

export interface Memo {
  id: string;
  kind: MemoKind;
  content: string;
  pinned: boolean;
  authorName: string;
  createdAt: string;
}

const KIND_META: Record<MemoKind, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: "destructive" | "success" | "default" | "muted";
  rowCls: string;
}> = {
  RISK:        { label: "리스크",   icon: AlertTriangle, badge: "destructive", rowCls: "border-destructive/30 bg-destructive/5" },
  OPPORTUNITY: { label: "기회",     icon: Sparkles,      badge: "success",     rowCls: "border-success/30 bg-success/5" },
  STRATEGY:    { label: "전략",     icon: FileText,      badge: "default",     rowCls: "border-primary/30 bg-primary/5" },
  GENERAL:     { label: "일반",     icon: StickyNote,    badge: "muted",       rowCls: "" },
};

// 데모용 mock — accountId별 메모 사전 시드
const SEED_MEMOS: Record<string, Memo[]> = {
  "acc-001": [
    { id: "m-1", kind: "STRATEGY",    pinned: true,
      content: "Q3까지 항공+호텔 패키지로 GP 30% 확장 합의. 응웬 사장 결정 대기. API 연동을 카드로 활용 가능.",
      authorName: "김민수", createdAt: dayOffset(-5) },
    { id: "m-2", kind: "RISK",        pinned: false,
      content: "API 연동 ABC측 IT 답신 지연 (2주). 6월 인보이스 발행 보류 가능성.",
      authorName: "이영준", createdAt: dayOffset(-3) },
    { id: "m-3", kind: "OPPORTUNITY", pinned: false,
      content: "베트남 중부 신규 호텔 3곳을 ABC에 제안하면 분기 +$30K 가능.",
      authorName: "김민수", createdAt: dayOffset(-1) },
  ],
  "acc-013": [
    { id: "m-13-1", kind: "STRATEGY", pinned: true,
      content: "Hana Tour는 분기 매출의 17% 차지. 5%p 이상 단가 인하 절대 불가. 부산·제주 권역 묶음으로 마진 보존.",
      authorName: "박지영", createdAt: dayOffset(-10) },
    { id: "m-13-2", kind: "OPPORTUNITY", pinned: false,
      content: "최영수 전무: 가족 휴가용 럭셔리 패키지 관심. 별도 라인업 검토.",
      authorName: "박지영", createdAt: dayOffset(-4) },
  ],
  "acc-011": [
    { id: "m-11-1", kind: "STRATEGY", pinned: true,
      content: "JTB Korea Desk가 한국 호텔 공급 결정권 보유. 코바야시 부장 라인 유지가 핵심.",
      authorName: "나카무라 켄지", createdAt: dayOffset(-8) },
    { id: "m-11-2", kind: "RISK", pinned: false,
      content: "엔화 약세로 H2 단가 협상 어려움 예상. 일본 시즌 가산 적용 협의 필요.",
      authorName: "나카무라 켄지", createdAt: dayOffset(-2) },
  ],
  "acc-009": [
    { id: "m-9-1", kind: "STRATEGY", pinned: true,
      content: "Saigontourist는 베트남 1위 OTA. 정산 신속·정확이 신뢰의 핵심. 분쟁 0 유지.",
      authorName: "Linh Tran", createdAt: dayOffset(-15) },
  ],
};

function dayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function AccountMemoPanel({ accountId }: { accountId: string }) {
  const toast = useToast();
  const [memos, setMemos] = useState<Memo[]>(() => SEED_MEMOS[accountId] ?? []);
  const [kind, setKind] = useState<MemoKind>("GENERAL");
  const [content, setContent] = useState("");

  const addMemo = () => {
    if (!content.trim()) return;
    const newMemo: Memo = {
      id: `m-${Date.now()}`,
      kind, content: content.trim(), pinned: false,
      authorName: "김민수", createdAt: new Date().toISOString(),
    };
    setMemos((prev) => [newMemo, ...prev]);
    setContent("");
    toast.success(`${KIND_META[kind].label} 메모 추가됨`);
  };

  const togglePin = (id: string) => {
    setMemos((prev) => prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)));
  };

  const remove = (id: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== id));
    toast.warning("메모 삭제됨");
  };

  const pinned = memos.filter((m) => m.pinned);
  const others = memos.filter((m) => !m.pinned);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />새 메모
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(KIND_META) as MemoKind[]).map((k) => {
              const meta = KIND_META[k];
              const Icon = meta.icon;
              return (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  data-active={kind === k}
                  className="rounded-md border py-2 text-xs flex flex-col items-center gap-1 hover:bg-accent data-[active=true]:border-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {meta.label}
                </button>
              );
            })}
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              kind === "STRATEGY" ? "장기 전략·핵심 가설을 정리하세요. (Pinned 권장)" :
              kind === "RISK"     ? "주의가 필요한 사안·잠재 위험을 기록하세요." :
              kind === "OPPORTUNITY" ? "추가 매출 기회·확장 아이디어를 기록하세요." :
              "고객사 관련 자유 메모"
            }
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={addMemo} disabled={!content.trim()} size="sm">메모 추가</Button>
          </div>
        </CardContent>
      </Card>

      {pinned.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground px-1 flex items-center gap-1">
            <Pin className="h-3 w-3" />Pinned ({pinned.length})
          </div>
          {pinned.map((m) => <MemoCard key={m.id} memo={m} onPin={togglePin} onRemove={remove} />)}
        </div>
      )}

      {others.length > 0 && (
        <div className="space-y-2">
          {pinned.length > 0 && (
            <div className="text-xs font-medium text-muted-foreground px-1">기타 ({others.length})</div>
          )}
          {others.map((m) => <MemoCard key={m.id} memo={m} onPin={togglePin} onRemove={remove} />)}
        </div>
      )}

      {memos.length === 0 && (
        <EmptyState
          icon={<StickyNote className="h-10 w-10" />}
          title="아직 메모가 없습니다"
          description="이 고객사에 대한 전략·기회·리스크를 기록하세요."
        />
      )}
    </div>
  );
}

function MemoCard({
  memo, onPin, onRemove,
}: { memo: Memo; onPin: (id: string) => void; onRemove: (id: string) => void }) {
  const meta = KIND_META[memo.kind];
  const Icon = meta.icon;
  return (
    <Card className={cn(meta.rowCls)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant={meta.badge} className="text-xs">
                <Icon className="h-3 w-3 mr-1" />
                {meta.label}
              </Badge>
              {memo.pinned && (
                <Badge variant="muted" className="text-xs">
                  <Pin className="h-3 w-3 mr-1" />Pinned
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {memo.authorName} · {relativeTime(memo.createdAt)}
              </span>
            </div>
            <div className="text-sm whitespace-pre-wrap">{memo.content}</div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7"
              onClick={() => onPin(memo.id)}
              aria-label={memo.pinned ? "Unpin" : "Pin"}
            >
              {memo.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onRemove(memo.id)}
              aria-label="삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
