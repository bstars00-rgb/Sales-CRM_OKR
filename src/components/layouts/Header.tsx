"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, LogOut, ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CommandK } from "@/components/layouts/CommandK";
import { NotificationBell } from "@/components/layouts/NotificationBell";
import { useActivityWizard } from "@/components/crm/ActivityWizard";
import { ROLE_LABEL, type SessionUser } from "@/lib/auth/types";
import { clearMockSession } from "@/lib/auth/session";

export function Header({ session }: { session: SessionUser }) {
  const router = useRouter();
  const wizard = useActivityWizard();

  const handleLogout = () => {
    clearMockSession();
    router.push("/login");
  };

  const initials = session.name
    .split(" ")
    .map((s) => s.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-14 border-b bg-card flex items-center px-4 md:px-6 gap-2 md:gap-4">
      <CommandK />
      <button
        onClick={() => {
          // dispatch synthetic Cmd+K
          const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true });
          window.dispatchEvent(ev);
        }}
        className="relative flex-1 max-w-md flex items-center gap-2 h-9 rounded-md bg-muted/50 hover:bg-muted px-3 text-left transition-colors"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground hidden sm:inline">고객사·딜·담당자 검색</span>
        <kbd className="ml-auto text-xs text-muted-foreground bg-background border rounded px-1.5 py-0.5 hidden md:inline-block">⌘K</kbd>
      </button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => wizard.open()}
        className="hidden md:inline-flex"
      >
        <Zap className="h-4 w-4" />활동 기록
      </Button>

      <ThemeToggle />
      <NotificationBell />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-2 h-9 rounded-md hover:bg-accent transition-colors">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="text-left hidden md:block">
            <div className="text-sm font-medium leading-tight">{session.name}</div>
            <div className="text-xs text-muted-foreground">{ROLE_LABEL[session.role]}</div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{session.name}</span>
              <span className="text-xs font-normal text-muted-foreground">{session.email}</span>
              <Badge variant="muted" className="mt-1 w-fit">
                {ROLE_LABEL[session.role]}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
