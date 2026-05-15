"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/common/ToastContext";
import { Phone, Calendar, Mail, MessageCircle, FileText, StickyNote, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { addActivity } from "@/lib/store/sales-store";
import { MOCK_CONTACTS } from "@/lib/mock/contacts";
import type { ActivityType } from "@/lib/mock/types";

// Web Speech API 타입 (브라우저 native, TS lib에 없음)
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
}

type Outcome = "POSITIVE" | "NEUTRAL" | "NEGATIVE";
type Channel = "CALL" | "MEETING" | "EMAIL" | "MESSENGER" | "PROPOSAL" | "NOTE";

interface OpenInput {
  accountId?: string;
  accountName?: string;
  dealId?: string;
  dealName?: string;
  contactId?: string;
  contactName?: string;
  defaultChannel?: Channel;
}

interface WizardContextValue {
  open: (input?: OpenInput) => void;
}

const WizardCtx = createContext<WizardContextValue | null>(null);

const CHANNELS: { value: Channel; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "CALL", label: "통화", icon: Phone },
  { value: "MEETING", label: "미팅", icon: Calendar },
  { value: "EMAIL", label: "이메일", icon: Mail },
  { value: "MESSENGER", label: "메신저", icon: MessageCircle },
  { value: "PROPOSAL", label: "제안", icon: FileText },
  { value: "NOTE", label: "메모", icon: StickyNote },
];

const OUTCOMES: { value: Outcome; emoji: string; label: string; cls: string }[] = [
  { value: "POSITIVE", emoji: "😊", label: "긍정", cls: "border-success/40 hover:bg-success/10 data-[active=true]:bg-success/20 data-[active=true]:border-success" },
  { value: "NEUTRAL",  emoji: "😐", label: "중립", cls: "hover:bg-accent data-[active=true]:bg-muted data-[active=true]:border-foreground" },
  { value: "NEGATIVE", emoji: "😟", label: "부정", cls: "border-destructive/40 hover:bg-destructive/10 data-[active=true]:bg-destructive/20 data-[active=true]:border-destructive" },
];

export function ActivityWizardRoot({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ctx, setCtx] = useState<OpenInput>({});
  const [channel, setChannel] = useState<Channel>("CALL");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [note, setNote] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const toast = useToast();

  // 선택된 계정의 담당자 목록
  const accountContacts = ctx.accountId
    ? MOCK_CONTACTS.filter((c) => c.accountId === ctx.accountId)
    : [];

  // 음성 받아쓰기 (Web Speech API)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  const startVoice = () => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      toast.warning("음성 받아쓰기 미지원", "Chrome / Edge 브라우저에서 사용 가능합니다");
      return;
    }
    const rec = new SR();
    rec.lang = "ko-KR";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setNote((prev) => {
        // 기존 메모 + final + interim 미리보기
        const base = prev.length > 0 && !prev.endsWith(finalText) ? prev : "";
        return (base + finalText + interim).trim();
      });
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const reset = () => {
    setOutcome(null);
    setNote("");
    setNextAction("");
    setNextDue("");
    setSelectedContactId("");
    if (listening) stopVoice();
  };

  const open = useCallback((input: OpenInput = {}) => {
    setCtx(input);
    if (input.defaultChannel) setChannel(input.defaultChannel);
    // contactId 또는 메인 담당자 자동 선택
    if (input.contactId) {
      setSelectedContactId(input.contactId);
    } else if (input.accountId) {
      const primary = MOCK_CONTACTS.find((c) => c.accountId === input.accountId && c.isPrimary);
      if (primary) setSelectedContactId(primary.id);
    }
    setIsOpen(true);
  }, []);

  const channelToActivityType = (c: Channel): ActivityType => {
    const map: Record<Channel, ActivityType> = {
      CALL: "CALL", MEETING: "MEETING", EMAIL: "EMAIL_LOG",
      MESSENGER: "MESSENGER", PROPOSAL: "PROPOSAL_SENT", NOTE: "NOTE",
    };
    return map[c];
  };

  const handleSave = (skip = false) => {
    const target = ctx.dealName ?? ctx.accountName ?? ctx.contactName ?? "기록";
    const channelLabel = CHANNELS.find((c) => c.value === channel)!.label;

    // 실제 store에 활동 기록 — 단, 어떤 대상도 지정 안 됐으면 skip
    if (ctx.accountId || ctx.dealId || ctx.contactId || selectedContactId) {
      const outcomeText = outcome === "POSITIVE" ? "긍정" : outcome === "NEUTRAL" ? "중립" : outcome === "NEGATIVE" ? "부정" : undefined;
      const finalContactId = selectedContactId || ctx.contactId;
      const finalContact = finalContactId ? MOCK_CONTACTS.find((c) => c.id === finalContactId) : undefined;
      const finalContactName = finalContact
        ? `${finalContact.firstName} ${finalContact.lastName ?? ""}`.trim()
        : ctx.contactName;
      addActivity({
        activityType: channelToActivityType(channel),
        userId: "user-mock-1",
        userName: "김민수",
        accountId: ctx.accountId,
        accountName: ctx.accountName,
        dealId: ctx.dealId,
        dealName: ctx.dealName,
        contactId: finalContactId,
        contactName: finalContactName,
        durationMinutes: channel === "CALL" || channel === "MEETING" ? 15 : undefined,
        subject: `${channelLabel} 기록${finalContactName ? ` — ${finalContactName}` : ""}`,
        content: note || undefined,
        outcome: outcomeText,
        nextAction: nextAction || undefined,
      });
    }

    if (skip || !outcome) {
      toast.show({
        title: "활동 저장",
        description: `${target} — 기록됨`,
      });
    } else {
      toast.success(
        `${channelLabel} 기록 완료`,
        nextAction ? `다음 액션: ${nextAction}${nextDue ? ` (${nextDue})` : ""}` : target
      );
    }
    setIsOpen(false);
    reset();
  };

  return (
    <WizardCtx.Provider value={{ open }}>
      {children}
      <Dialog
        open={isOpen}
        onOpenChange={(o) => {
          setIsOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="sm:max-w-md max-sm:fixed max-sm:inset-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:max-w-none max-sm:rounded-none max-sm:h-screen max-sm:overflow-y-auto">
          <DialogHeader>
            <DialogTitle>활동 기록</DialogTitle>
            {(ctx.accountName || ctx.dealName) && (
              <DialogDescription>
                {ctx.dealName ? <span className="font-medium">{ctx.dealName}</span> : null}
                {ctx.accountName && ctx.dealName ? " · " : null}
                {ctx.accountName ? ctx.accountName : null}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">채널</div>
              <div className="grid grid-cols-6 gap-1.5">
                {CHANNELS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setChannel(value)}
                    data-active={channel === value}
                    className="flex flex-col items-center gap-1 rounded-md border py-2 text-xs hover:bg-accent transition-colors data-[active=true]:bg-primary/10 data-[active=true]:border-primary data-[active=true]:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {accountContacts.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1.5">담당자 (선택)</div>
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— 담당자 선택 안 함 —</option>
                  {accountContacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName ?? ""} ({c.title ?? "—"})
                      {c.isPrimary ? " · 메인" : ""}
                      {c.decisionPower >= 4 ? " · 결정권자" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">결과는?</div>
              <div className="grid grid-cols-3 gap-2">
                {OUTCOMES.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setOutcome(o.value)}
                    data-active={outcome === o.value}
                    className={cn(
                      "rounded-md border py-2.5 text-sm flex flex-col items-center gap-1 transition-colors",
                      o.cls
                    )}
                  >
                    <span className="text-lg">{o.emoji}</span>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center justify-between">
                <span>한 줄 메모</span>
                {voiceSupported && (
                  <button
                    onClick={listening ? stopVoice : startVoice}
                    className={cn(
                      "inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors",
                      listening
                        ? "bg-destructive/10 text-destructive animate-pulse"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    {listening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                    {listening ? "녹음 중지" : "음성 입력"}
                  </button>
                )}
              </div>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={listening ? "🎙 듣고 있습니다..." : "결과·요점 한 줄"}
                className={listening ? "border-destructive/50" : ""}
              />
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1.5">다음 액션 (선택)</div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="무엇을"
                  className="col-span-2"
                />
                <Input
                  type="date"
                  value={nextDue}
                  onChange={(e) => setNextDue(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <Button variant="ghost" onClick={() => handleSave(true)}>
              건너뛰고 저장
            </Button>
            <Button onClick={() => handleSave(false)}>저장하기</Button>
          </div>
        </DialogContent>
      </Dialog>
    </WizardCtx.Provider>
  );
}

export function useActivityWizard() {
  const ctx = useContext(WizardCtx);
  if (!ctx) throw new Error("useActivityWizard must be used within <ActivityWizardRoot>");
  return ctx;
}
