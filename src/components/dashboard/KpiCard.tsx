import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import type { KpiCard as KpiCardType } from "@/lib/mock/types";

const PACING_COLOR = {
  ok:   "bg-success/10 text-success",
  warn: "bg-warning/10 text-warning",
  bad:  "bg-destructive/10 text-destructive",
} as const;

function formatValue(card: KpiCardType): string {
  if (card.unit === "KRW" || card.unit === "USD") return formatCurrency(card.current, card.unit);
  if (card.unit === "%") return formatPercent(card.current, 1);
  return `${formatNumber(card.current)}${card.unit ? ` ${card.unit}` : ""}`;
}

function formatTarget(card: KpiCardType): string {
  if (card.target === 0) return "";
  if (card.unit === "KRW" || card.unit === "USD") return `목표 ${formatCurrency(card.target, card.unit)}`;
  if (card.unit === "%") return `목표 ${formatPercent(card.target, 0)}`;
  return `목표 ${formatNumber(card.target)}`;
}

function pacingState(achievementPct: number): "ok" | "warn" | "bad" {
  if (achievementPct >= 90) return "ok";
  if (achievementPct >= 70) return "warn";
  return "bad";
}

export function KpiCardWidget({ card }: { card: KpiCardType }) {
  const showAchievement = card.target > 0;
  const state = showAchievement ? pacingState(card.achievementPct) : "ok";
  const color = PACING_COLOR[state];

  return (
    <Card>
      <CardContent className="p-3 md:p-5">
        <div className="text-xs md:text-sm text-muted-foreground mb-1 line-clamp-1">{card.label}</div>
        <div className="text-lg md:text-2xl font-bold tracking-tight">{formatValue(card)}</div>
        <div className="mt-1.5 md:mt-2 flex items-center gap-2 text-xs flex-wrap">
          {showAchievement && (
            <span className={cn("rounded px-1.5 py-0.5 font-medium", color)}>
              {formatPercent(card.achievementPct, 0)}
            </span>
          )}
          <span className="text-muted-foreground">{formatTarget(card)}</span>
          {card.yoyDelta !== undefined && (
            <span className={cn("ml-auto", card.yoyDelta >= 0 ? "text-success" : "text-destructive")}>
              YoY {card.yoyDelta >= 0 ? "▲" : "▼"} {Math.abs(card.yoyDelta)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
