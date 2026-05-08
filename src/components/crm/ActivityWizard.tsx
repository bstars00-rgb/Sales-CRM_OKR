"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/common/ToastContext";
import { Phone, Calendar, Mail, MessageCircle, FileText, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Outcome = "POSITIVE" | "NEUTRAL" | "NEGATIVE";
type Channel = "CALL" | "MEETING" | "EMAIL" | "MESSENGER" | "PROPOSAL" | "NOTE";

interface OpenInput {
  accountName?: string;
  dealName?: string;
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
  const toast = useToast();

  const reset = () => {
    setOutcome(null);
    setNote("");
    setNextAction("");
    setNextDue("");
  };

  const open = useCallback((input: OpenInput = {}) => {
    setCtx(input);
    if (input.defaultChannel) setChannel(input.defaultChannel);
    setIsOpen(true);
  }, []);

  const handleSave = (skip = false) => {
    const target = ctx.dealName ?? ctx.accountName ?? ctx.contactName ?? "기록";
    if (skip || !outcome) {
      toast.show({
        title: "활동 저장 (건너뜀)",
        description: `${target} — 추가 정보 없이 기록`,
      });
    } else {
      toast.success(
        `${CHANNELS.find((c) => c.value === channel)!.label} 기록 완료`,
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
        <DialogContent className="sm:max-w-md">
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
              <div className="text-xs font-medium text-muted-foreground mb-1.5">한 줄 메모</div>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="결과·요점 한 줄"
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
