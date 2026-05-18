"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/common/ToastContext";
import { useOneOnOnes, type OneOnOne } from "@/lib/store/one-on-ones";
import { MOCK_TEAM_MEMBERS } from "@/lib/mock/kpi";
import { relativeTime } from "@/lib/utils/format";
import { Users, Plus, Edit3, Trash2, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const CURRENT_LEAD = { id: "user-park", name: "박상무" }; // mock

interface DraftForm {
  memberId: string;
  meetingDate: string;
  agenda: string;
  achievements: string;
  concerns: string;
  actionItems: string;
  rating: 1 | 2 | 3 | 4 | 5;
  followUpAt: string;
}

const EMPTY_DRAFT: DraftForm = {
  memberId: "",
  meetingDate: new Date().toISOString().split("T")[0],
  agenda: "",
  achievements: "",
  concerns: "",
  actionItems: "",
  rating: 3,
  followUpAt: "",
};

export default function OneOnOnesPage() {
  const oneOnOnes = useOneOnOnes();
  const toast = useToast();
  const [draft, setDraft] = useState<DraftForm | null>(null);

  const allMembers = MOCK_TEAM_MEMBERS;
  const all = oneOnOnes.all();

  // 멤버별 마지막 1on1 + 누락 감지
  const memberStatus = useMemo(() => {
    return allMembers.map((m) => {
      const list = oneOnOnes.forMember(m.userId);
      const latest = list[0];
      const daysSince = latest
        ? Math.floor((Date.now() - new Date(latest.meetingDate).getTime()) / 86400000)
        : null;
      return {
        member: m,
        latest,
        count: list.length,
        daysSince,
        overdue: daysSince === null || daysSince > 28,
      };
    }).sort((a, b) => {
      if (a.overdue && !b.overdue) return -1;
      if (!a.overdue && b.overdue) return 1;
      return (b.daysSince ?? 999) - (a.daysSince ?? 999);
    });
  }, [allMembers, oneOnOnes, all]);

  const overdueCount = memberStatus.filter((s) => s.overdue).length;

  const openCreate = (memberId: string) => {
    setDraft({ ...EMPTY_DRAFT, memberId });
  };

  const submit = () => {
    if (!draft || !draft.memberId) return;
    const member = allMembers.find((m) => m.userId === draft.memberId);
    if (!member) return;
    oneOnOnes.add({
      memberId: draft.memberId,
      memberName: member.name,
      leadId: CURRENT_LEAD.id,
      leadName: CURRENT_LEAD.name,
      meetingDate: draft.meetingDate,
      agenda: draft.agenda || undefined,
      achievements: draft.achievements || undefined,
      concerns: draft.concerns || undefined,
      actionItems: draft.actionItems || undefined,
      rating: draft.rating,
      followUpAt: draft.followUpAt || undefined,
    });
    toast.success("1on1 기록 저장됨", `${member.name}님과의 미팅 노트가 저장되었습니다`);
    setDraft(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("이 1on1 기록을 삭제하시겠습니까?")) return;
    oneOnOnes.remove(id);
    toast.warning("기록 삭제됨");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          1on1 노트
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          팀원 {allMembers.length}명 · 총 {oneOnOnes.count}건 기록
          {overdueCount > 0 && <span className="text-destructive ml-2">· ⚠ {overdueCount}명 4주+ 누락</span>}
        </p>
      </div>

      {/* 누락 경고 */}
      {overdueCount > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold">💬 1on1 누락 알림</div>
              <p className="text-muted-foreground mt-1">
                4주 이상 1on1이 없는 팀원이 <b>{overdueCount}명</b> 있습니다. 정기 미팅 일정을 잡으세요.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 팀원별 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">팀원별 마지막 1on1</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {memberStatus.map((s) => (
              <div key={s.member.userId} className="p-3 flex items-center gap-3 hover:bg-accent/20">
                <Avatar className="h-8 w-8"><AvatarFallback>{s.member.name.slice(0, 1)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{s.member.name}</div>
                  <div className="text-xs text-muted-foreground">{s.member.role}</div>
                </div>
                <div className="text-xs text-right shrink-0 w-32">
                  {s.latest ? (
                    <>
                      <div className={cn("tabular-nums", s.overdue ? "text-destructive font-semibold" : "")}>
                        {s.daysSince}일 전
                      </div>
                      <div className="text-muted-foreground">{s.latest.meetingDate}</div>
                    </>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">기록 없음</Badge>
                  )}
                </div>
                <Badge variant="muted" className="shrink-0 text-[10px]">{s.count}건</Badge>
                <Button size="sm" variant="outline" onClick={() => openCreate(s.member.userId)}>
                  <Plus className="h-3.5 w-3.5" />새 1on1
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 최근 기록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            최근 기록 ({all.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {all.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              아직 기록이 없습니다. 위 팀원의 [새 1on1] 버튼으로 첫 미팅을 기록하세요.
            </div>
          ) : (
            <ul className="divide-y">
              {all.slice(0, 20).map((o) => (
                <OneOnOneRow key={o.id} o={o} onDelete={() => handleDelete(o.id)} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 작성 모달 */}
      <Dialog open={draft !== null} onOpenChange={(v) => { if (!v) setDraft(null); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 1on1 기록</DialogTitle>
            <DialogDescription>
              {draft?.memberId && (() => {
                const m = allMembers.find((x) => x.userId === draft.memberId);
                return m ? `${m.name} (${m.role}) 와의 미팅` : "";
              })()}
            </DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="미팅 일자">
                  <Input
                    type="date"
                    value={draft.meetingDate}
                    onChange={(e) => setDraft({ ...draft, meetingDate: e.target.value })}
                  />
                </Field>
                <Field label="컨디션 (1-5)">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setDraft({ ...draft, rating: n as 1 | 2 | 3 | 4 | 5 })}
                        className={cn(
                          "h-9 flex-1 rounded border text-xs font-medium transition-colors",
                          draft.rating === n
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-input hover:bg-accent",
                        )}
                      >
                        {n === 1 ? "😞" : n === 2 ? "🙁" : n === 3 ? "😐" : n === 4 ? "🙂" : "😄"} {n}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <Field label="📋 안건 / 진행 사항">
                <textarea
                  value={draft.agenda}
                  onChange={(e) => setDraft({ ...draft, agenda: e.target.value })}
                  placeholder="이번 미팅에서 다룬 주제…"
                  className="w-full min-h-[60px] rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </Field>
              <Field label="🏆 잘한 것 / 성취">
                <textarea
                  value={draft.achievements}
                  onChange={(e) => setDraft({ ...draft, achievements: e.target.value })}
                  placeholder="멤버가 잘한 것·인정해줄 부분…"
                  className="w-full min-h-[60px] rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </Field>
              <Field label="⚠ 우려 / 막힌 것">
                <textarea
                  value={draft.concerns}
                  onChange={(e) => setDraft({ ...draft, concerns: e.target.value })}
                  placeholder="멤버가 어려워하는 것·블로커…"
                  className="w-full min-h-[60px] rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </Field>
              <Field label="✅ 액션 아이템 (다음까지)">
                <textarea
                  value={draft.actionItems}
                  onChange={(e) => setDraft({ ...draft, actionItems: e.target.value })}
                  placeholder="다음 1on1까지 약속한 것들…"
                  className="w-full min-h-[60px] rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </Field>
              <Field label="📅 다음 1on1 예정 (선택)">
                <Input
                  type="date"
                  value={draft.followUpAt}
                  onChange={(e) => setDraft({ ...draft, followUpAt: e.target.value })}
                />
              </Field>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" onClick={() => setDraft(null)}>취소</Button>
                <Button onClick={submit}><CheckCircle2 className="h-4 w-4" />저장</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      {children}
    </div>
  );
}

function OneOnOneRow({ o, onDelete }: { o: OneOnOne; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const ratingEmoji = o.rating === 1 ? "😞" : o.rating === 2 ? "🙁" : o.rating === 3 ? "😐" : o.rating === 4 ? "🙂" : o.rating === 5 ? "😄" : "—";

  return (
    <li className="p-3 hover:bg-accent/20 transition-colors group">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{ratingEmoji}</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{o.memberName}</span>
            <span className="text-muted-foreground text-xs">↔ {o.leadName}</span>
            <Badge variant="muted" className="text-[10px]">{o.meetingDate}</Badge>
            <span className="text-xs text-muted-foreground ml-auto">{relativeTime(o.createdAt)}</span>
          </div>
          {o.agenda && !expanded && (
            <div className="text-xs text-muted-foreground mt-1 truncate">{o.agenda}</div>
          )}
          {expanded && (
            <div className="mt-2 space-y-2 text-sm">
              {o.agenda && (
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground">📋 안건</div>
                  <div className="whitespace-pre-wrap">{o.agenda}</div>
                </div>
              )}
              {o.achievements && (
                <div>
                  <div className="text-[10px] font-semibold text-success">🏆 잘한 것</div>
                  <div className="whitespace-pre-wrap">{o.achievements}</div>
                </div>
              )}
              {o.concerns && (
                <div>
                  <div className="text-[10px] font-semibold text-warning">⚠ 우려</div>
                  <div className="whitespace-pre-wrap">{o.concerns}</div>
                </div>
              )}
              {o.actionItems && (
                <div>
                  <div className="text-[10px] font-semibold text-primary">✅ 액션</div>
                  <div className="whitespace-pre-wrap">{o.actionItems}</div>
                </div>
              )}
              {o.followUpAt && (
                <div className="text-xs text-muted-foreground">📅 다음: {o.followUpAt}</div>
              )}
            </div>
          )}
        </button>
        <button
          onClick={onDelete}
          aria-label="삭제"
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-destructive shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

void Edit3;
