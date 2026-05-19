"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MOCK_OBJECTIVES } from "@/lib/mock/kpi";
import { filterObjectivesForUser } from "@/lib/okr/visibility";
import { useSession } from "@/lib/auth/useSession";
import { ROLE_LABEL } from "@/lib/auth/types";
import { Target, ArrowDown, ArrowLeft, Eye } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useMemo } from "react";

const KIND_BADGE = {
  COMPANY: { label: "회사", variant: "default" as const, color: "border-primary/40 bg-primary/5" },
  TEAM:    { label: "팀",   variant: "secondary" as const, color: "border-secondary bg-secondary/30" },
  USER:    { label: "개인", variant: "muted" as const, color: "border-muted bg-muted/20" },
};

export default function OkrTreePage() {
  const session = useSession();
  const visible = useMemo(
    () => (session ? filterObjectivesForUser(MOCK_OBJECTIVES, session) : MOCK_OBJECTIVES),
    [session]
  );
  const company = visible.find((o) => o.ownerKind === "COMPANY");
  const team = visible.find((o) => o.ownerKind === "TEAM");
  const user = visible.find((o) => o.ownerKind === "USER");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/okr" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />OKR
        </Link>
        <span>/</span>
        <span className="text-foreground">트리 뷰</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OKR 정렬 트리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            회사 → 팀 → 개인 OKR이 어떻게 연결되는지 시각화
            {session && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span className="text-xs">{ROLE_LABEL[session.role]} 뷰</span>
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/okr">리스트 뷰</Link>
        </Button>
      </div>

      <div className="space-y-1">
        {company && (
          <>
            <TreeNode obj={company} level={0} />
            <Connector />
            {team && (
              <>
                <TreeNode obj={team} level={1} />
                <Connector />
                {user && <TreeNode obj={user} level={2} />}
              </>
            )}
          </>
        )}
      </div>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 text-sm text-muted-foreground">
          💡 회사 OKR이 팀 OKR로, 다시 개인 OKR로 어떻게 분해되는지 한눈에 봅니다.
          실제 운영 시에는 같은 분기에 회사 1~3개 / 팀당 2~5개 / 개인 3~5개 정도가 적정.
        </CardContent>
      </Card>
    </div>
  );
}

function TreeNode({ obj, level }: { obj: typeof MOCK_OBJECTIVES[number]; level: number }) {
  const kindInfo = KIND_BADGE[obj.ownerKind];
  const indent = level * 32;
  return (
    <div style={{ marginLeft: indent }}>
      <Card className={cn("transition-shadow hover:shadow-md", kindInfo.color)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Badge variant={kindInfo.variant}>{kindInfo.label}</Badge>
              <span className="text-xs text-muted-foreground">{obj.ownerName} · {obj.periodLabel}</span>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold tabular-nums">{obj.progressPct}%</div>
            </div>
          </div>
          <div className="flex items-start gap-2 mb-3">
            <Target className="h-4 w-4 text-primary mt-1 shrink-0" />
            <div className="font-medium leading-tight">{obj.title}</div>
          </div>
          <Progress value={obj.progressPct} className="mb-3" />
          <div className="space-y-1">
            {obj.keyResults.map((kr) => (
              <div key={kr.id} className="flex items-center justify-between text-xs gap-2">
                <span className="text-muted-foreground truncate">• {kr.title}</span>
                <span
                  className={cn(
                    "font-medium tabular-nums shrink-0",
                    kr.progressPct >= 90 ? "text-success" :
                    kr.progressPct >= 60 ? "text-warning" :
                    "text-destructive"
                  )}
                >
                  {kr.progressPct}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center text-muted-foreground">
        <div className="h-4 w-px bg-border" />
        <ArrowDown className="h-3 w-3" />
      </div>
    </div>
  );
}
