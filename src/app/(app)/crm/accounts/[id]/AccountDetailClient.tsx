"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradeBadge, StatusBadge, SegmentBadge, CountryFlag, RiskDot } from "@/components/crm/AccountBadges";
import { useActivityWizard } from "@/components/crm/ActivityWizard";
import { AccountMemoPanel } from "@/components/crm/AccountMemoPanel";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { MOCK_CONTACTS } from "@/lib/mock/contacts";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_ACTIVITIES } from "@/lib/mock/activities";
import { formatCurrency, relativeTime, formatPercent } from "@/lib/utils/format";
import { ArrowLeft, Star, Plus, Phone, Mail, MessageCircle, FileText, Calendar, BarChart3, StickyNote } from "lucide-react";

const ACTIVITY_ICON: Record<string, string> = {
  CALL: "📞", MEETING: "📅", EMAIL_LOG: "✉", MESSENGER: "💬",
  PROPOSAL_SENT: "📝", CONTRACT_SENT: "✍", NOTE: "🗒",
  FOLLOW_UP: "🔄", CUSTOMER_REQUEST: "👤", INTERNAL_REQUEST: "🤝",
};

export function AccountDetailClient({ id }: { id: string }) {
  const wizard = useActivityWizard();
  const account = MOCK_ACCOUNTS.find((a) => a.id === id);
  if (!account) notFound();

  const contacts = MOCK_CONTACTS.filter((c) => c.accountId === account.id);
  const deals = MOCK_DEALS.filter((d) => d.accountId === account.id);
  const openDeals = deals.filter((d) => d.outcome === "OPEN");
  const wonDeals = deals.filter((d) => d.outcome === "WON");
  const activities = MOCK_ACTIVITIES.filter((a) => a.accountId === account.id);
  const pipelineAmount = openDeals.reduce((s, d) => s + d.amount, 0);
  const wonAmount = wonDeals.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/crm/accounts" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          고객사
        </Link>
        <span>/</span>
        <span className="text-foreground">{account.name}</span>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-[280px]">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-muted-foreground hover:text-warning cursor-pointer" />
                <h1 className="text-2xl font-bold tracking-tight">{account.name}</h1>
                <GradeBadge grade={account.grade} />
                <StatusBadge status={account.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span><CountryFlag code={account.countryCode} /> {account.countryName}, {account.city}</span>
                <span>· <SegmentBadge segment={account.segment} /></span>
                <span>· 담당: {account.ownerName}</span>
                <span>· 첫 컨택 {account.firstContactDate}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                <span>최근 접촉 <strong>{relativeTime(account.lastActivityAt)}</strong></span>
                {account.nextActionTitle && (
                  <span>· 다음 액션 <strong>{account.nextActionTitle}</strong></span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mt-2">
                <span className="flex items-center gap-1.5">리스크 <RiskDot level={account.riskLevel} /> {account.riskLevel}</span>
                <span className="flex items-center gap-1.5">성장 가능성 <RiskDot level={account.growthPotential} /> {account.growthPotential}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-stretch min-w-[160px]">
              <Button asChild>
                <Link href={`/crm/accounts/${account.id}/insight`}>
                  <BarChart3 className="h-4 w-4" />미팅 모드
                </Link>
              </Button>
              <Button variant="outline" onClick={() => wizard.open({ accountName: account.name })}>
                <Calendar className="h-4 w-4" />활동 기록
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="overview">
            <div className="overflow-x-auto -mx-1 px-1">
              <TabsList className="w-max">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="contacts">담당자 ({contacts.length})</TabsTrigger>
                <TabsTrigger value="deals">딜 ({deals.length})</TabsTrigger>
                <TabsTrigger value="activities">활동 ({activities.length})</TabsTrigger>
                <TabsTrigger value="memo">메모</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>📈 매출 요약</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Stat label="YTD 거래액" value={formatCurrency(account.totalRevenueYtd)} />
                  <Stat label="YTD GP"
                        value={formatCurrency(account.totalGpYtd)}
                        sub={account.totalRevenueYtd > 0 ? formatPercent((account.totalGpYtd / account.totalRevenueYtd) * 100, 1) + " GP율" : ""} />
                  <Stat label="3M 거래액" value={formatCurrency(account.revenue3M)} />
                  <Stat label="3M GP" value={formatCurrency(account.gp3M)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>💼 파이프라인 요약</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <Stat label="OPEN 딜" value={`${openDeals.length}건`} sub={formatCurrency(pipelineAmount)} />
                  <Stat label="WON YTD" value={`${wonDeals.length}건`} sub={formatCurrency(wonAmount)} />
                  <Stat label="평균 클로징" value={openDeals.length > 0 ? `${Math.round(openDeals.reduce((s, d) => s + d.probabilityPct, 0) / openDeals.length)}%` : "—"} sub="확률 평균" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts">
              <div className="grid gap-3 md:grid-cols-2">
                {contacts.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between mb-1">
                        <div className="font-semibold">
                          {c.firstName} {c.lastName ?? ""}
                        </div>
                        {c.isPrimary && <Badge variant="default">메인</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{c.title}</div>
                      <div className="flex gap-3 text-xs">
                        <span>의사결정 {"●".repeat(c.decisionPower)}{"○".repeat(5 - c.decisionPower)}</span>
                        <span>영향력 {"●".repeat(c.influence)}{"○".repeat(5 - c.influence)}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs mt-2 text-muted-foreground">
                        {c.email && <span><Mail className="inline h-3 w-3" /> {c.email}</span>}
                        {c.phone && <span><Phone className="inline h-3 w-3" /> {c.phone}</span>}
                        {c.messengerKind && <span><MessageCircle className="inline h-3 w-3" /> {c.messengerKind}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="deals">
              <div className="space-y-2">
                {deals.map((d) => (
                  <Card key={d.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <Link href={`/crm/deals/kanban`} className="font-medium hover:underline">
                          {d.name}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {d.stageName} · {d.dealType} · 클로징 {d.expectedCloseDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium tabular-nums">{formatCurrency(d.amount)}</div>
                        <Badge variant={d.outcome === "WON" ? "success" : d.outcome === "LOST" ? "destructive" : "outline"}>
                          {d.outcome} {d.probabilityPct > 0 && d.outcome === "OPEN" ? `· ${d.probabilityPct}%` : ""}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activities">
              <div className="space-y-3">
                {activities.map((a) => (
                  <div key={a.id} className="flex gap-3 border-b pb-3 last:border-0">
                    <div className="text-xl">{ACTIVITY_ICON[a.activityType] ?? "•"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">{a.userName}</span>
                        <span className="text-muted-foreground"> · </span>
                        <span className="text-muted-foreground">{relativeTime(a.occurredAt)}</span>
                        {a.durationMinutes && (
                          <span className="text-muted-foreground"> · {a.durationMinutes}분</span>
                        )}
                      </div>
                      {a.subject && <div className="text-sm font-medium mt-0.5">{a.subject}</div>}
                      {a.content && <div className="text-sm text-muted-foreground mt-1">{a.content}</div>}
                      {a.nextAction && (
                        <div className="text-xs mt-1.5 text-primary">▶ 다음 액션: {a.nextAction}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="memo">
              <AccountMemoPanel accountId={account.id} />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-3">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">📋 다음 액션</CardTitle></CardHeader>
            <CardContent>
              {account.nextActionTitle ? (
                <>
                  <div className="font-medium text-sm">{account.nextActionTitle}</div>
                  {account.nextActionAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(account.nextActionAt).toLocaleString("ko-KR")}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">잡힌 액션이 없습니다.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">💼 진행중 딜 ({openDeals.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {openDeals.map((d) => (
                <div key={d.id} className="text-sm border-b last:border-0 pb-2">
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground flex justify-between mt-0.5">
                    <span>{d.stageName}</span>
                    <span>{formatCurrency(d.amount)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">⚡ 빠른 활동 기록</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              {[
                { label: "통화", icon: Phone, channel: "CALL" as const },
                { label: "미팅", icon: Calendar, channel: "MEETING" as const },
                { label: "이메일", icon: Mail, channel: "EMAIL" as const },
                { label: "메신저", icon: MessageCircle, channel: "MESSENGER" as const },
                { label: "제안", icon: FileText, channel: "PROPOSAL" as const },
                { label: "메모", icon: StickyNote, channel: "NOTE" as const },
              ].map(({ label, icon: Icon, channel }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  className="flex-col h-16 gap-1"
                  onClick={() => wizard.open({ accountName: account.name, defaultChannel: channel })}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold mt-0.5">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
