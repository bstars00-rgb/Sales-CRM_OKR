"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle() {
  const { theme, resolved, setTheme, toggle } = useTheme();

  return (
    <div className="flex">
      <button
        onClick={toggle}
        aria-label="테마 전환"
        className="inline-flex h-9 w-9 items-center justify-center rounded-l-md hover:bg-accent transition-colors"
      >
        {resolved === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="테마 옵션"
          className="inline-flex h-9 w-5 items-center justify-center rounded-r-md hover:bg-accent transition-colors -ml-px text-muted-foreground"
        >
          <span className="text-[10px]">▾</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel className="text-xs text-muted-foreground">테마</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ThemeOption icon={<Sun className="h-4 w-4" />} label="라이트" active={theme === "light"} onClick={() => setTheme("light")} />
          <ThemeOption icon={<Moon className="h-4 w-4" />} label="다크" active={theme === "dark"} onClick={() => setTheme("dark")} />
          <ThemeOption icon={<Monitor className="h-4 w-4" />} label="시스템" active={theme === "system"} onClick={() => setTheme("system")} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ThemeOption({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className={cn("cursor-pointer", active && "bg-accent")}
    >
      <span className="mr-2 flex h-4 w-4 items-center justify-center">{icon}</span>
      {label}
      {active && <span className="ml-auto text-xs">✓</span>}
    </DropdownMenuItem>
  );
}
