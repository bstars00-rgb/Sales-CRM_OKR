import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, LayoutDashboard, Building2, Briefcase, Target, FileText, Sparkles } from "lucide-react";

const QUICK_LINKS = [
  { href: "/dashboard/manager", label: "내 대시보드", icon: LayoutDashboard },
  { href: "/crm/accounts",      label: "고객사",     icon: Building2 },
  { href: "/crm/deals/kanban",  label: "딜 칸반",    icon: Briefcase },
  { href: "/okr",               label: "OKR",        icon: Target },
  { href: "/brief",             label: "주간보고",   icon: FileText },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-2xl w-full text-center">
        <div className="text-7xl font-bold text-muted-foreground/40 mb-2 select-none">404</div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-muted-foreground mb-6">
          URL이 변경되었거나 삭제됐을 수 있습니다. 아래에서 원하는 화면을 찾아보세요.
        </p>

        {/* 빠른 이동 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-1.5 rounded-md border bg-card hover:bg-accent hover:border-primary/40 transition-all p-3"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/crm/accounts">
              <Search className="h-4 w-4" />고객사 둘러보기
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />홈으로
            </Link>
          </Button>
        </div>

        <div className="mt-6 text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          <kbd className="rounded border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">Cmd+K</kbd>
          <span>를 눌러 빠르게 검색할 수도 있습니다</span>
        </div>
      </div>
    </div>
  );
}
