"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
}

interface Group {
  title: string;
  items: Shortcut[];
}

const GROUPS: Group[] = [
  {
    title: "전역",
    items: [
      { keys: ["?"],         description: "단축키 도움말 (이 창)" },
      { keys: ["⌘", "K"],    description: "전역 검색 (172개 엔티티)" },
      { keys: ["Esc"],       description: "모달/Drawer 닫기" },
    ],
  },
  {
    title: "이동",
    items: [
      { keys: ["g", "d"],    description: "내 대시보드" },
      { keys: ["g", "a"],    description: "고객사 리스트" },
      { keys: ["g", "k"],    description: "딜 칸반" },
      { keys: ["g", "f"],    description: "Pipeline Forecast" },
      { keys: ["g", "h"],    description: "호텔 지표" },
      { keys: ["g", "o"],    description: "OKR" },
      { keys: ["g", "t"],    description: "태스크" },
      { keys: ["g", "b"],    description: "주간보고" },
    ],
  },
  {
    title: "리스트 내",
    items: [
      { keys: ["↑", "↓"],    description: "이전/다음 항목 (Cmd+K 결과)" },
      { keys: ["Enter"],     description: "선택 항목 열기" },
    ],
  },
  {
    title: "도움말",
    items: [
      { keys: ["Shift", "?"], description: "온보딩 투어 다시 보기" },
    ],
  },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 입력 요소에서는 단축키 무시
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const editable = target?.isContentEditable;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || editable) return;

      // ? 키 → 도움말
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+? → 온보딩 재실행
          window.dispatchEvent(new CustomEvent("sales-crm:open-onboarding"));
        } else {
          setOpen(true);
        }
        return;
      }

      // g + ? 시퀀스 처리
      if (e.key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setLastKey("g");
        setTimeout(() => setLastKey(null), 1000);
        return;
      }

      if (lastKey === "g") {
        const route = G_ROUTES[e.key.toLowerCase()];
        if (route) {
          e.preventDefault();
          router.push(route);
          setLastKey(null);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lastKey, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            키보드 단축키
          </DialogTitle>
          <DialogDescription>
            <kbd className="font-mono">?</kbd>를 눌러 언제든 이 창을 다시 열 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {g.title}
              </div>
              <div className="space-y-1.5">
                {g.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1">
                    <span className="text-foreground">{item.description}</span>
                    <span className="flex items-center gap-1">
                      {item.keys.map((k, j) => (
                        <span key={j} className="flex items-center gap-1">
                          {j > 0 && <span className="text-muted-foreground text-xs mx-0.5">+</span>}
                          <kbd className="rounded border bg-muted/60 px-1.5 py-0.5 font-mono text-xs shadow-sm">
                            {k}
                          </kbd>
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-3 mt-2">
          💡 <kbd className="font-mono">g</kbd>를 먼저 누르고 1초 내에 다음 키를 누르세요 (e.g. <kbd className="font-mono">g</kbd> → <kbd className="font-mono">d</kbd>).
        </div>
      </DialogContent>
    </Dialog>
  );
}

const G_ROUTES: Record<string, string> = {
  d: "/dashboard/manager",
  a: "/crm/accounts",
  k: "/crm/deals/kanban",
  f: "/crm/forecast",
  h: "/crm/hotel-metrics",
  o: "/okr",
  t: "/tasks",
  b: "/brief",
};
