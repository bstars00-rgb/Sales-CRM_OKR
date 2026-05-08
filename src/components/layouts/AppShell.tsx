"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { getMockSession } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/types";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = getMockSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
    setHydrated(true);
  }, [router]);

  if (!hydrated || !session) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      <Sidebar role={session.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header session={session} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
