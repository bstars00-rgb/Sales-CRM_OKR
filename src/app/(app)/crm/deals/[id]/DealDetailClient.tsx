"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { GradeBadge, CountryFlag } from "@/components/crm/AccountBadges";
import { useActivityWizard } from "@/components/crm/ActivityWizard";
import { useToast } from "@/components/common/ToastContext";
import { MOCK_DEALS, MOCK_STAGES } from "@/lib/mock/deals";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { MOCK_CONTACTS } from "@/lib/mock/contacts";
import { MOCK_ACTIVITIES } from "@/lib/mock/activities";
import { MOCK_CRITICAL_6 } from "@/lib/mock/kpi";
import {
  markDealWon as storeMarkDealWon,
  markDealLost as storeMarkDealLost,
  useSalesVersion,
} from "@/lib/store/sales-store";
import { formatCurrency, relativeTime, formatPercent } from "@/lib/utils/format";
import { ArrowLeft, Trophy, X, AlertTriangle, Users, Calendar, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ACTIVITY_ICON: Record<string, string> = {
  CALL: "📞", MEETING: "📅", EMAIL_LOG: "✉", MESSENGER: "💬",
  PROPOSAL_SENT: "📝", CONTRACT_SENT: "✍", NOTE: "🗒",
};

const LOST_REASONS = ["PRICE", "TIMING", "COMPETITOR", "BUDGET", "DECISION_MAKER", "OTHER"];
const WIN_REASONS = ["RELATIONSHIP", "PRICE", "FEATURE", "TIMING", "REFERRAL", "OTHER"];

export function DealDetailClient({ id }: { id: string }) {
  const wizard = useActivityWizard();
  const toast = useToast();
  const version = useSalesVersion();
  const initialDeal = MOCK_DEALS.find((d) => d.id === id);
  if (!initialDeal) notFound();
  // Re-fetch deal whenever store version changes (store mutates the array in place)
  const deal = MOCK_DEALS.find((d) => d.id === id)!;
  void version; // dependency hook
  const [winOpen, setWinOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [reasonCode, setReasonCode] = useState("");
  const [reasonNote, setReasonNote] = useState("");

  const account = MOCK_ACCOUNTS.find((a) => a.id === deal.accountId);
  const contacts = MOCK_CONTACTS.filter((c) => c.accountId === deal.accountId);
  const activities = MOCK_ACTIVITIES.filter((a) => a.dealId === deal.id);
  const openStages = MOCK_STAGES.filter((s) => s.stageKind === "OPEN");

  const isWon = deal.outcome === "WON";
  const isLost = deal.outcome === "LOST";
  const isOpen = deal.outcome === "OPEN";

  const onMarkWon = () => {
    storeMarkDealWon(deal.id, reasonCode);
    setWinOpen(false);
    setReasonCode("");
    setReasonNote("");
    // 연결된 Critical 6가 자동 done 처리됐는지 확인
    const linkedC6 = MOCK_CRITICAL_6.filter((c) => c.linkedDealId === deal.id);
    const c6Note = linkedC6.length > 0 ? ` · Critical 6 ${linkedC6.length}건 자동 완료` : "";
    toast.success("Deal Won 🎉", `${deal.name}을 성공으로 처리했습니다${c6Note}`);
  };

  const onMarkLost = () => {
    storeMarkDealLost(deal.id, reasonCode);
    setLostOpen(false);
    setReasonCode("");
    setReasonNote("");
    toast.warning("Deal Lost", `${deal.name} — 사유: ${reasonCode}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/crm/deals/kanban" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />칸반
        </Link>
        <span>/</span>
        <span className="text-foreground">{deal.name}</span>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{deal.name}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1.5">
            <Link href={`/crm/accounts/${deal.accountId}`} className="hover:text-foreground hover:underline">
              {deal.accountName}
            </Link>
            <span>· <CountryFlag code={deal.countryCode} /> {account?.countryName}</span>
            <span>· <GradeBadge grade={deal.grade} /></span>
            <span>· {deal.dealType}</span>
            <span>· 담당 {deal.ownerName}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {isOpen && (
            <>
              <Button variant="outline" size="sm" onClick={() => setLostOpen(true)}>
                <X className="h-4 w-4" />Lost
              </Button>
              <Button variant="success" size="sm" onClick={() => setWinOpen(true)}>
                <Trophy className="h-4 w-4" />Win
              </Button>
            </>
          )}
          {isWon && <Badge variant="success" className="text-sm px-3 py-1">🏆 WON</Badge>}
          {isLost && <Badge variant="destructive" className="text-sm px-3 py-1">✕ LOST</Badge>}
        </div>
      </div>

      {isOpen && (
        <Card>
          <CardContent className="p-5">
            <div className="text-xs font-medium text-muted-foreground mb-2">단계 진행</div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {openStages.map((s) => {
                const passed = s.orderNo < deal.stageOrder;
                const current = s.orderNo === deal.stageOrder;
                return (
                  <div key={s.id} className="flex items-center gap-1 shrink-0">
                    <div
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium border whitespace-nowrap",
                        passed && "bg-success/10 border-success/30 text-success",
                        current && "bg-primary text-primary-foreground border-primary",
                        !passed && !current && "bg-muted/30 text-muted-foreground"
                      )}
                    >
                      {passed && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                      {s.name}
                    </div>
                    {s.orderNo < openStages.length && (
                      <span className="text-muted-foreground">›</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              현재 <span className="font-medium text-foreground">{deal.stageName}</span> · {deal.daysInStage}일 체류
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>💰 거래 정보</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Stat label="예상 거래액" value={formatCurrency(deal.amount)} />
              <Stat label="예상 GP" value={formatCurrency(deal.expectedGp)}
                    sub={deal.amount > 0 ? formatPercent((deal.expectedGp / deal.amount) * 100, 1) + " 마진" : ""} />
              <Stat label="성공률" value={`${deal.probabilityPct}%`} />
              <Stat label="클로징 예정" value={deal.expectedCloseDate} />
              <Stat label="딜 타입" value={deal.dealType.replace(/_/g, " ")} />
              <Stat label="통화" value={deal.currency} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>📅 활동 타임라인 ({activities.length})</CardTitle></CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  아직 활동 기록이 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((a) => (
                    <div key={a.id} className="flex gap-3 border-b last:border-0 pb-3">
                      <div className="text-xl">{ACTIVITY_ICON[a.activityType] ?? "•"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          <span className="font-medium">{a.userName}</span>
                          <span className="text-muted-foreground"> · {relativeTime(a.occurredAt)}</span>
                          {a.durationMinutes && <span className="text-muted-foreground"> · {a.durationMinutes}분</span>}
                        </div>
                        {a.subject && <div className="text-sm font-medium mt-0.5">{a.subject}</div>}
                        {a.content && <div className="text-sm text-muted-foreground mt-1">{a.content}</div>}
                        {a.nextAction && (
                          <div className="text-xs mt-1.5 text-primary">▶ 다음: {a.nextAction}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => wizard.open({ accountId: deal.accountId, accountName: deal.accountName, dealId: deal.id, dealName: deal.name })}
              >
                활동 기록하기
              </Button>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-3">
          {deal.blockers && deal.blockers.length > 0 && (
            <Card className="border-warning/40 bg-warning/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />장애 요인
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {deal.blockers.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Badge
                      variant={b.severity === "HIGH" ? "destructive" : "warning"}
                      className="text-xs shrink-0 mt-0.5"
                    >
                      {b.severity}
                    </Badge>
                    <span>{b.title}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />관련 담당자
            </CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {contacts.length === 0 ? (
                <div className="text-sm text-muted-foreground">등록된 담당자가 없습니다.</div>
              ) : (
                contacts.map((c) => (
                  <div key={c.id} className="text-sm border-b last:border-0 pb-2">
                    <div className="font-medium">{c.firstName} {c.lastName ?? ""}</div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>{c.title}</span>
                      <span>의사결정 {"●".repeat(c.decisionPower)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />클로징 예정
            </CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deal.expectedCloseDate}</div>
              <div className="text-xs text-muted-foreground mt-1">{deal.daysInStage}일 단계 체류 중</div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Win Modal */}
      <Dialog open={winOpen} onOpenChange={setWinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deal Won 🏆</DialogTitle>
            <DialogDescription>
              {deal.name} ({formatCurrency(deal.amount)}) — 성공 사유를 기록해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">사유</div>
              <div className="grid grid-cols-3 gap-1.5">
                {WIN_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReasonCode(r)}
                    data-active={reasonCode === r}
                    className="rounded-md border py-2 text-xs hover:bg-accent data-[active=true]:bg-success/10 data-[active=true]:border-success/40 data-[active=true]:text-success"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <Input
              placeholder="추가 메모 (선택)"
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWinOpen(false)}>취소</Button>
            <Button variant="success" onClick={onMarkWon} disabled={!reasonCode}>Won 처리</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lost Modal */}
      <Dialog open={lostOpen} onOpenChange={setLostOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deal Lost</DialogTitle>
            <DialogDescription>
              {deal.name} — 실패 사유를 기록해주세요. 나중에 추세 분석에 사용됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">사유</div>
              <div className="grid grid-cols-3 gap-1.5">
                {LOST_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReasonCode(r)}
                    data-active={reasonCode === r}
                    className="rounded-md border py-2 text-xs hover:bg-accent data-[active=true]:bg-destructive/10 data-[active=true]:border-destructive/40 data-[active=true]:text-destructive"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <Input
              placeholder="추가 메모 (선택)"
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLostOpen(false)}>취소</Button>
            <Button variant="destructive" onClick={onMarkLost} disabled={!reasonCode}>Lost 처리</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold mt-0.5">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
