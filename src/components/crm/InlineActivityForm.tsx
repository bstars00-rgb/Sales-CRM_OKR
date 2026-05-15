"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/common/ToastContext";
import { addActivity } from "@/lib/store/sales-store";
import { cn } from "@/lib/utils/cn";
import { Phone, Calendar, Mail, MessageCircle, FileText, StickyNote, Send } from "lucide-react";
import type { ActivityType } from "@/lib/mock/types";

type Channel = "CALL" | "MEETING" | "EMAIL" | "MESSENGER" | "PROPOSAL" | "NOTE";

const CHANNELS: { value: Channel; label: string; icon: React.ComponentType<{ className?: string }>; activityType: ActivityType }[] = [
  { value: "CALL",      label: "통화", icon: Phone,         activityType: "CALL" },
  { value: "MEETING",   label: "미팅", icon: Calendar,      activityType: "MEETING" },
  { value: "EMAIL",     label: "메일", icon: Mail,          activityType: "EMAIL_LOG" },
  { value: "MESSENGER", label: "카톡", icon: MessageCircle, activityType: "MESSENGER" },
  { value: "PROPOSAL",  label: "제안", icon: FileText,      activityType: "PROPOSAL_SENT" },
  { value: "NOTE",      label: "메모", icon: StickyNote,    activityType: "NOTE" },
];

const OUTCOMES = [
  { value: "POSITIVE", emoji: "😊", label: "긍정",  cls: "data-[active=true]:bg-success/20 data-[active=true]:border-success" },
  { value: "NEUTRAL",  emoji: "😐", label: "중립",  cls: "data-[active=true]:bg-muted data-[active=true]:border-foreground" },
  { value: "NEGATIVE", emoji: "😟", label: "부정",  cls: "data-[active=true]:bg-destructive/20 data-[active=true]:border-destructive" },
] as const;

export function InlineActivityForm({
  accountId, accountName, dealId, dealName,
}: {
  accountId?: string;
  accountName?: string;
  dealId?: string;
  dealName?: string;
}) {
  const toast = useToast();
  const [channel, setChannel] = useState<Channel>("CALL");
  const [outcome, setOutcome] = useState<typeof OUTCOMES[number]["value"] | null>(null);
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(false);

  const save = () => {
    if (!note.trim() && !outcome) {
      toast.warning("메모 또는 결과 입력", "최소 하나는 입력해주세요");
      return;
    }
    const ch = CHANNELS.find((c) => c.value === channel)!;
    const outcomeText = outcome === "POSITIVE" ? "긍정" : outcome === "NEUTRAL" ? "중립" : outcome === "NEGATIVE" ? "부정" : undefined;
    addActivity({
      activityType: ch.activityType,
      userId: "user-mock-1",
      userName: "김민수",
      accountId,
      accountName,
      dealId,
      dealName,
      durationMinutes: channel === "CALL" || channel === "MEETING" ? 10 : undefined,
      subject: `${ch.label} 기록`,
      content: note || undefined,
      outcome: outcomeText,
    });
    toast.success(`${ch.label} 기록 완료`, note || accountName || "기록됨");
    setNote("");
    setOutcome(null);
    setExpanded(false);
  };

  return (
    <div className="space-y-2.5">
      {/* 채널 — 3×2 그리드 */}
      <div className="grid grid-cols-3 gap-1.5">
        {CHANNELS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => { setChannel(value); setExpanded(true); }}
            data-active={channel === value}
            className="flex flex-col items-center gap-0.5 rounded-md border py-2 text-xs hover:bg-accent transition-colors data-[active=true]:bg-primary/10 data-[active=true]:border-primary data-[active=true]:text-primary"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* 결과 + 메모 (선택된 채널 있을 때) */}
      {expanded && (
        <>
          <div className="grid grid-cols-3 gap-1.5">
            {OUTCOMES.map((o) => (
              <button
                key={o.value}
                onClick={() => setOutcome(o.value)}
                data-active={outcome === o.value}
                className={cn(
                  "rounded-md border py-1.5 text-xs flex items-center justify-center gap-1 transition-colors",
                  o.cls
                )}
              >
                <span>{o.emoji}</span>{o.label}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="한 줄 메모..."
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setExpanded(false); setNote(""); setOutcome(null); }} className="flex-1">
              취소
            </Button>
            <Button size="sm" onClick={save} className="flex-1">
              <Send className="h-3 w-3" />저장
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
