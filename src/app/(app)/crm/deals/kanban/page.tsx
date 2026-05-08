"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GradeBadge, CountryFlag } from "@/components/crm/AccountBadges";
import { MOCK_DEALS, MOCK_STAGES } from "@/lib/mock/deals";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Plus, Filter } from "lucide-react";

const STAGE_AVG_DAYS = 7;

function dotColor(days: number) {
  if (days >= STAGE_AVG_DAYS * 2) return "🔴";
  if (days >= STAGE_AVG_DAYS * 1.5) return "🟡";
  return "🟢";
}

export default function DealKanbanPage() {
  const openStages = MOCK_STAGES.filter((s) => s.stageKind === "OPEN");
  const dealsByStage = openStages.map((s) => ({
    stage: s,
    deals: MOCK_DEALS.filter((d) => d.stageId === s.id && d.outcome === "OPEN"),
  }));
  const wonDeals = MOCK_DEALS.filter((d) => d.outcome === "WON");
  const lostDeals = MOCK_DEALS.filter((d) => d.outcome === "LOST");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">딜 칸반</h1>
          <p className="text-sm text-muted-foreground mt-1">
            OPEN {MOCK_DEALS.filter((d) => d.outcome === "OPEN").length} · WON {wonDeals.length} · LOST {lostDeals.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="h-4 w-4" />필터</Button>
          <Button size="sm"><Plus className="h-4 w-4" />새 딜</Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-3">
        <div className="flex gap-3 min-w-max">
          {dealsByStage.map((b) => (
            <KanbanColumn key={b.stage.id} stage={b.stage} deals={b.deals} />
          ))}
          <div className="w-px bg-border mx-1" />
          <KanbanColumn stage={MOCK_STAGES.find((s) => s.stageKind === "WON")!} deals={wonDeals} terminal="won" />
          <KanbanColumn stage={MOCK_STAGES.find((s) => s.stageKind === "LOST")!} deals={lostDeals} terminal="lost" />
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  deals,
  terminal,
}: {
  stage: { id: string; name: string };
  deals: typeof MOCK_DEALS;
  terminal?: "won" | "lost";
}) {
  const total = deals.reduce((s, d) => s + d.amount, 0);
  const totalGp = deals.reduce((s, d) => s + d.expectedGp, 0);
  return (
    <div className="w-72 shrink-0">
      <div className="px-2 mb-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{stage.name}</span>
          <Badge variant="muted">{deals.length}</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
          {formatCurrency(total)} · GP {formatCurrency(totalGp)}
        </div>
      </div>
      <div className="space-y-2">
        {deals.map((d) => (
          <Card
            key={d.id}
            className={cn(
              "p-3 cursor-pointer hover:shadow-md transition-shadow",
              terminal === "won" && "border-success/50 bg-success/5",
              terminal === "lost" && "border-destructive/50 bg-destructive/5 opacity-75"
            )}
          >
            <div className="font-medium text-sm leading-tight mb-2 line-clamp-2">{d.name}</div>
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
        ))}
        {deals.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed rounded-md">
            없음
          </div>
        )}
      </div>
    </div>
  );
}
