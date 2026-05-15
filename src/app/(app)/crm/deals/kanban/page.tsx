"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GradeBadge, CountryFlag } from "@/components/crm/AccountBadges";
import { useToast } from "@/components/common/ToastContext";
import { MOCK_DEALS, MOCK_STAGES } from "@/lib/mock/deals";
import { MOCK_CRITICAL_6 } from "@/lib/mock/kpi";
import { moveDealStage, useSalesVersion } from "@/lib/store/sales-store";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Plus, Filter, ExternalLink } from "lucide-react";

const STAGE_AVG_DAYS = 7;

function dotColor(days: number) {
  if (days >= STAGE_AVG_DAYS * 2) return "🔴";
  if (days >= STAGE_AVG_DAYS * 1.5) return "🟡";
  return "🟢";
}

export default function DealKanbanPage() {
  const version = useSalesVersion();
  const toast = useToast();
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  void version;

  const openStages = MOCK_STAGES.filter((s) => s.stageKind === "OPEN");
  const dealsByStage = openStages.map((s) => ({
    stage: s,
    deals: MOCK_DEALS.filter((d) => d.stageId === s.id && d.outcome === "OPEN"),
  }));
  const wonDeals = MOCK_DEALS.filter((d) => d.outcome === "WON");
  const lostDeals = MOCK_DEALS.filter((d) => d.outcome === "LOST");

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("text/plain", dealId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(dealId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOver(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOver !== stageId) setDragOver(stageId);
  };

  const handleDragLeave = (e: React.DragEvent, stageId: string) => {
    // 자식 요소로 enter한 경우엔 leave 무시
    const related = e.relatedTarget as Node | null;
    if (e.currentTarget.contains(related)) return;
    if (dragOver === stageId) setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain");
    const deal = MOCK_DEALS.find((d) => d.id === dealId);
    setDragOver(null);
    setDraggingId(null);
    if (!deal || deal.stageId === stageId) return;

    const targetStage = MOCK_STAGES.find((s) => s.id === stageId);
    if (!targetStage) return;

    moveDealStage(dealId, stageId);

    // 자동 C6 처리 알림
    const linkedC6 = MOCK_CRITICAL_6.filter((c) => c.linkedDealId === dealId).length;
    const c6Note = (targetStage.stageKind === "WON" && linkedC6 > 0)
      ? ` · C6 ${linkedC6}건 자동 완료`
      : "";
    toast.success(
      `${deal.name} → ${targetStage.name}`,
      `단계 이동 완료${c6Note}`
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">딜 칸반</h1>
          <p className="text-sm text-muted-foreground mt-1">
            OPEN {MOCK_DEALS.filter((d) => d.outcome === "OPEN").length} · WON {wonDeals.length} · LOST {lostDeals.length}
            <span className="hidden md:inline"> · 카드를 끌어 단계 이동</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="h-4 w-4" />필터</Button>
          <Button size="sm" asChild>
            <Link href="/crm/deals/new"><Plus className="h-4 w-4" />새 딜</Link>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-3">
        <div className="flex gap-3 min-w-max">
          {dealsByStage.map((b) => (
            <KanbanColumn
              key={b.stage.id}
              stage={b.stage}
              deals={b.deals}
              dragOver={dragOver === b.stage.id}
              draggingId={draggingId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, b.stage.id)}
              onDragLeave={(e) => handleDragLeave(e, b.stage.id)}
              onDrop={(e) => handleDrop(e, b.stage.id)}
            />
          ))}
          <div className="w-px bg-border mx-1" />
          <KanbanColumn
            stage={MOCK_STAGES.find((s) => s.stageKind === "WON")!}
            deals={wonDeals}
            terminal="won"
            dragOver={dragOver === "stg-9"}
            draggingId={draggingId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, "stg-9")}
            onDragLeave={(e) => handleDragLeave(e, "stg-9")}
            onDrop={(e) => handleDrop(e, "stg-9")}
          />
          <KanbanColumn
            stage={MOCK_STAGES.find((s) => s.stageKind === "LOST")!}
            deals={lostDeals}
            terminal="lost"
            dragOver={dragOver === "stg-10"}
            draggingId={draggingId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, "stg-10")}
            onDragLeave={(e) => handleDragLeave(e, "stg-10")}
            onDrop={(e) => handleDrop(e, "stg-10")}
          />
        </div>
      </div>
    </div>
  );
}

interface ColumnProps {
  stage: { id: string; name: string };
  deals: typeof MOCK_DEALS;
  terminal?: "won" | "lost";
  dragOver: boolean;
  draggingId: string | null;
  onDragStart: (e: React.DragEvent, dealId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

function KanbanColumn({
  stage, deals, terminal, dragOver, draggingId,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
}: ColumnProps) {
  const total = deals.reduce((s, d) => s + d.amount, 0);
  const totalGp = deals.reduce((s, d) => s + d.expectedGp, 0);
  return (
    <div
      className={cn(
        "w-72 shrink-0 rounded-md transition-colors p-1.5 -m-1.5",
        dragOver && "bg-primary/10 ring-2 ring-primary/40"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="px-2 mb-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{stage.name}</span>
          <Badge variant="muted">{deals.length}</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
          {formatCurrency(total)} · GP {formatCurrency(totalGp)}
        </div>
      </div>
      <div className="space-y-2 min-h-[100px]">
        {deals.map((d) => (
          <div
            key={d.id}
            draggable
            onDragStart={(e) => onDragStart(e, d.id)}
            onDragEnd={onDragEnd}
            className={cn(
              "transition-opacity",
              draggingId === d.id && "opacity-30"
            )}
          >
            <Card
              className={cn(
                "p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/40 transition-all relative group",
                terminal === "won" && "border-success/50 bg-success/5",
                terminal === "lost" && "border-destructive/50 bg-destructive/5 opacity-75"
              )}
            >
              <Link
                href={`/crm/deals/${d.id}`}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                aria-label="상세로 이동"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <div className="font-medium text-sm leading-tight mb-2 line-clamp-2 pr-5">{d.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-1 mb-2">{d.accountName}</div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold tabular-nums">{formatCurrency(d.amount)}</span>
                <span className="flex items-center gap-1">
                  <CountryFlag code={d.countryCode} />
                  <GradeBadge grade={d.grade} />
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                <span>📅 {d.expectedCloseDate}</span>
                {!terminal && <span>{dotColor(d.daysInStage)} {d.daysInStage}일</span>}
              </div>
              {d.blockers && d.blockers.length > 0 && !terminal && (
                <div className="mt-2 pt-2 border-t">
                  {d.blockers.map((b, i) => (
                    <div key={i} className="text-xs text-warning flex items-start gap-1">
                      ⚠ {b.title}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        ))}
        {deals.length === 0 && !dragOver && (
          <div className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed rounded-md">
            없음
          </div>
        )}
        {dragOver && (
          <div className="text-xs text-primary text-center py-8 border-2 border-dashed border-primary/40 rounded-md bg-primary/5">
            여기에 놓기 ↓
          </div>
        )}
      </div>
    </div>
  );
}
