"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_ACTIVITIES } from "@/lib/mock/activities";
import { formatNumber, relativeTime } from "@/lib/utils/format";
import { Plus } from "lucide-react";

const ICON: Record<string, string> = {
  CALL: "📞", MEETING: "📅", EMAIL_LOG: "✉", MESSENGER: "💬",
  PROPOSAL_SENT: "📝", CONTRACT_SENT: "✍", NOTE: "🗒",
};

export default function ActivitiesPage() {
  const sorted = [...MOCK_ACTIVITIES].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">활동 타임라인</h1>
          <p className="text-sm text-muted-foreground mt-1">{formatNumber(sorted.length)}건</p>
        </div>
        <Button><Plus className="h-4 w-4" />활동 기록</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {sorted.map((a) => (
              <div key={a.id} className="p-4 hover:bg-accent/30 transition-colors">
                <div className="flex gap-3">
                  <div className="text-2xl">{ICON[a.activityType] ?? "•"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium">{a.userName}</span>
                      <span className="text-muted-foreground"> · </span>
                      <span className="text-muted-foreground">{relativeTime(a.occurredAt)}</span>
                      {a.durationMinutes && <span className="text-muted-foreground"> · {a.durationMinutes}분</span>}
                      {a.accountName && (
                        <>
                          <span className="text-muted-foreground"> · </span>
                          <span>{a.accountName}</span>
                        </>
                      )}
                    </div>
                    {a.subject && <div className="text-sm font-medium mt-1">{a.subject}</div>}
                    {a.content && <div className="text-sm text-muted-foreground mt-1">{a.content}</div>}
                    {a.outcome && (
                      <div className="text-xs mt-1.5">
                        <span className="text-muted-foreground">결과: </span>
                        {a.outcome}
                      </div>
                    )}
                    {a.nextAction && (
                      <div className="text-xs mt-1.5 text-primary">▶ 다음 액션: {a.nextAction}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
