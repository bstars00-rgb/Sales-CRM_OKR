"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { MOCK_CRITICAL_6 } from "@/lib/mock/kpi";

export default function CriticalSixPage() {
  const [items, setItems] = useState(MOCK_CRITICAL_6);
  const done = items.filter((i) => i.done).length;
  const week = currentIsoWeek();

  const toggle = (idx: number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, done: !it.done } : it)));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Critical 6</h1>
        <p className="text-sm text-muted-foreground mt-1">2026 W{week} · 김민수 · 이번주 우선순위 6개</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>이번주 진척</span>
            <Badge variant={done >= 5 ? "success" : done >= 3 ? "warning" : "destructive"}>
              {done}/{items.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(done / items.length) * 100} className="mb-5" />
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((it, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`text-left rounded-lg border p-4 hover:bg-accent/30 transition-colors ${it.done ? "bg-success/5 border-success/30" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {it.done ? (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`font-medium ${it.done ? "line-through text-muted-foreground" : ""}`}>
                      {it.title}
                    </div>
                    {it.linkedDealName && (
                      <div className="text-xs text-muted-foreground mt-1">🔗 {it.linkedDealName}</div>
                    )}
                    {it.by && (
                      <div className="text-xs text-muted-foreground mt-1">~ {it.by}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          💡 카드를 클릭해서 완료/미완료를 토글할 수 있습니다. 일요일 21시까지 다음주 Critical 6은 Weekly Brief 작성과 함께 자동 생성됩니다.
        </CardContent>
      </Card>
    </div>
  );
}

function currentIsoWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
