"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { getMockSession } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/types";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const s = getMockSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
    setHydrated(true);
  }, [router]);

  // 닫혀있을 때 ESC로 drawer 닫기
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  if (!hydrated || !session) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* 데스크탑 사이드바 */}
      <div className="hidden lg:block">
        <Sidebar role={session.role} />
      </div>

      {/* 모바일 drawer */}
      {drawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-50">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-md bg-card hover:bg-accent"
              aria-label="메뉴 닫기"
            >
              <X className="h-5 w-5" />
            </button>
            <div onClick={() => setDrawerOpen(false)}>
              <Sidebar role={session.role} />
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-stretch">
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden inline-flex h-14 w-14 items-center justify-center hover:bg-accent transition-colors border-b border-r bg-card"
            aria-label="메뉴 열기"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <Header session={session} />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
