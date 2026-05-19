"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/common/PrintButton";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_TASKS, MOCK_ACTIVITIES } from "@/lib/mock/activities";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { MOCK_CONTRACTS, getDaysUntilExpiry } from "@/lib/mock/contracts";
import { useSalesVersion } from "@/lib/store/sales-store";
import { getAllComments } from "@/lib/store/comments";
import { useNotificationRules } from "@/lib/store/notification-rules";
import { assessDealRisk } from "@/lib/analytics/risk-score";
import { formatCurrency } from "@/lib/utils/format";
import { Bell, Sparkles, ArrowRight, Mail, AlertTriangle } from "lucide-react";

const CURRENT_USER_ID = "user-mock-1";

export default function DigestPage() {
  const version = useSalesVersion();
  const { rules } = useNotificationRules();
  void version;

  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  // 일간: 어제~오늘
  // 주간: 7일 전~오늘
  const data = useMemo(() => {
    // 1) 어제 새 활동
    const newActivities = MOCK_ACTIVITIES.filter(
      (a) => new Date(a.occurredAt) >= yesterday
    );

    // 2) 어제 새 댓글/멘션
    const newComments = getAllComments().filter(
      (c) => new Date(c.createdAt) >= yesterday
    );
    const mentions = newComments.filter((c) => c.mentions.includes(CURRENT_USER_ID));

    // 3) 현재 위험도 HIGH/CRITICAL 딜
    const openDeals = MOCK_DEALS.filter((d) => d.outcome === "OPEN");
    const riskyDeals = openDeals
      .map((d) => ({ deal: d, risk: assessDealRisk(d) }))
      .filter((x) => x.risk.level === "HIGH" || x.risk.level === "CRITICAL")
      .sort((a, b) => b.risk.score - a.risk.score);

    // 4) 갱신 임박 (60일 이내)
    const renewals = MOCK_CONTRACTS
      .map((c) => ({
        c,
        account: MOCK_ACCOUNTS.find((a) => a.id === c.accountId),
        daysLeft: getDaysUntilExpiry(c.contractEndDate),
      }))
      .filter((x) => x.daysLeft >= 0 && x.daysLeft <= rules.renewalWarnDays && !x.c.autoRenew && x.account)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    // 5) 지연 태스크
    const overdueTasks = MOCK_TASKS.filter((t) =>
      t.status === "TODO" && t.dueAt && new Date(t.dueAt) < today
    );

    // 6) 이번주 WON / LOST
    const recentWon = MOCK_DEALS.filter((d) => d.outcome === "WON" && d.daysInStage <= 7);
    const recentLost = MOCK_DEALS.filter((d) => d.outcome === "LOST" && d.daysInStage <= 7);

    return {
      newActivities, newComments, mentions, riskyDeals, renewals, overdueTasks,
      recentWon, recentLost,
    };
  }, [yesterday, today, rules.renewalWarnDays]);

  const totalSignals = data.mentions.length + data.riskyDeals.length + data.renewals.length + data.overdueTasks.length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            알림 다이제스트
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {today.toISOString().split("T")[0]} 기준 일간/주간 요약 · 신호 {totalSignals}개
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="다이제스트 인쇄" />
          <Button asChild size="sm">
            <Link href="/settings/notifications">
              <Sparkles className="h-4 w-4" />룰 설정
            </Link>
          </Button>
        </div>
      </div>

      {/* 핵심 인사이트 */}
      <Card className={totalSignals > 5 ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"}>
        <CardContent className="p-4 flex items-start gap-3">
          {totalSignals > 5 ? (
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          ) : (
            <Sparkles className="h-5 w-5 text-success shrink-0 mt-0.5" />
          )}
          <div className="text-sm space-y-1">
            <div className="font-semibold">📊 오늘의 핵심</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <Stat label="긴급 위험 딜" value={data.riskyDeals.length} link="#risky" />
              <Stat label="갱신 임박" value={data.renewals.length} link="#renewals" />
              <Stat label="@나에게 멘션" value={data.mentions.length} link="#mentions" />
              <Stat label="지연 태스크" value={data.overdueTasks.length} link="#tasks" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 어제~오늘 새 활동 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📅 24시간 활동 ({data.newActivities.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.newActivities.length === 0 ? (
            <div className="text-sm text-muted-foreground py-3">최근 24시간 새 활동 없음.</div>
          ) : (
            <ul className="text-sm space-y-1.5">
              {data.newActivities.slice(0, 8).map((a) => (
                <li key={a.id} className="flex gap-2">
                  <span className="text-muted-foreground tabular-nums shrink-0">{a.activityType}</span>
                  <span>{a.userName} · {a.accountName ?? "—"}</span>
                  {a.subject && <span className="text-muted-foreground truncate">— {a.subject}</span>}
                </li>
              ))}
              {data.newActivities.length > 8 && (
                <li className="text-xs text-muted-foreground">… +{data.newActivities.length - 8}건 더</li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 위험 딜 */}
      <Card id="risky" className="scroll-mt-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            긴급 위험 딜 ({data.riskyDeals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.riskyDeals.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4">위험 딜 없음 👍</div>
          ) : (
            <ul className="divide-y">
              {data.riskyDeals.slice(0, 5).map(({ deal, risk }) => (
                <li key={deal.id} className="p-3 hover:bg-accent/20">
                  <Link href={`/crm/deals/${deal.id}`} className="block">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm hover:underline">{deal.name}</span>
                      <Badge variant="destructive" className="text-xs">{risk.score}/100</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {deal.accountName} · {formatCurrency(deal.amount)} · {deal.stageName}
                    </div>
                    <div className="text-xs mt-1">💡 {risk.recommendation}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 갱신 임박 */}
      <Card id="renewals" className="scroll-mt-4">
        <CardHeader>
          <CardTitle className="text-base">🔁 계약 갱신 임박 ({data.renewals.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.renewals.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4">갱신 임박 계약 없음.</div>
          ) : (
            <ul className="divide-y">
              {data.renewals.slice(0, 5).map(({ c, account, daysLeft }) => (
                <li key={c.accountId} className="p-3 hover:bg-accent/20">
                  <Link href="/crm/renewals" className="block">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm hover:underline">{account!.name}</span>
                      <Badge variant={daysLeft <= 30 ? "destructive" : "warning"} className="text-xs">
                        {daysLeft}일 후 만료
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(c.annualValue)} · {account!.countryName} · 자동 갱신 아님
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 멘션 */}
      <Card id="mentions" className="scroll-mt-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            @나에게 온 멘션 ({data.mentions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.mentions.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4">멘션 없음.</div>
          ) : (
            <ul className="divide-y">
              {data.mentions.slice(0, 5).map((c) => {
                const href = c.refType === "deal" ? `/crm/deals/${c.refId}` : `/crm/accounts/${c.refId}`;
                return (
                  <li key={c.id} className="p-3 hover:bg-accent/20">
                    <Link href={href} className="block">
                      <div className="text-sm">
                        <span className="font-medium">{c.authorName}</span>
                        <span className="text-muted-foreground"> · {c.refType === "deal" ? "딜" : "고객사"}</span>
                      </div>
                      <div className="text-sm mt-0.5 text-muted-foreground truncate">{c.body}</div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 지연 태스크 */}
      <Card id="tasks" className="scroll-mt-4">
        <CardHeader>
          <CardTitle className="text-base">⏰ 지연 태스크 ({data.overdueTasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.overdueTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4">지연 태스크 없음 👍</div>
          ) : (
            <ul className="divide-y">
              {data.overdueTasks.slice(0, 5).map((t) => {
                const daysLate = t.dueAt
                  ? Math.floor((Date.now() - new Date(t.dueAt).getTime()) / 86400000)
                  : 0;
                return (
                  <li key={t.id} className="p-3 hover:bg-accent/20">
                    <Link href="/tasks" className="block">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm hover:underline">{t.title}</span>
                        <Badge variant="destructive" className="text-xs">{daysLate}일 지연</Badge>
                      </div>
                      {t.relatedAccountName && (
                        <div className="text-xs text-muted-foreground mt-0.5">{t.relatedAccountName}</div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 이번주 결과 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🏆 이번주 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded border border-success/30 bg-success/5 p-3">
              <div className="text-xs text-muted-foreground">WON</div>
              <div className="text-xl font-bold text-success tabular-nums">{data.recentWon.length}건</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(data.recentWon.reduce((s, d) => s + d.amount, 0))}
              </div>
            </div>
            <div className="rounded border border-destructive/30 bg-destructive/5 p-3">
              <div className="text-xs text-muted-foreground">LOST</div>
              <div className="text-xl font-bold text-destructive tabular-nums">{data.recentLost.length}건</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(data.recentLost.reduce((s, d) => s + d.amount, 0))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-3 text-xs text-muted-foreground">
          💡 이 페이지는 클라이언트에서 매번 재계산됩니다. 룰은 <Link className="underline" href="/settings/notifications">알림 룰 설정</Link>에서 조정 가능합니다.
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, link }: { label: string; value: number; link: string }) {
  return (
    <Link href={link} className="block rounded border bg-card p-2 hover:bg-accent/30 transition-colors text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
        보기 <ArrowRight className="h-2 w-2" />
      </div>
    </Link>
  );
}
