"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MOCK_TASKS } from "@/lib/mock/activities";
import type { Task } from "@/lib/mock/types";
import { Plus } from "lucide-react";

const PRIO_COLOR: Record<Task["priority"], "destructive" | "warning" | "muted"> = {
  HIGH: "destructive", MED: "warning", LOW: "muted",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);

  const overdue = tasks.filter((t) => t.dueAt && new Date(t.dueAt) < today && t.status === "TODO");
  const todayList = tasks.filter((t) => {
    if (!t.dueAt) return false;
    const due = new Date(t.dueAt);
    return due >= today && due < new Date(today.getTime() + 86400000) && t.status === "TODO";
  });
  const thisWeek = tasks.filter((t) => {
    if (!t.dueAt) return false;
    const due = new Date(t.dueAt);
    return due >= new Date(today.getTime() + 86400000) && due < endOfWeek && t.status === "TODO";
  });
  const assigned = tasks.filter((t) => t.status === "TODO");

  const toggle = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: t.status === "DONE" ? "TODO" : "DONE" } : t));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">태스크</h1>
        <Button><Plus className="h-4 w-4" />새 태스크</Button>
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">오늘 ({todayList.length})</TabsTrigger>
          <TabsTrigger value="week">이번주 ({thisWeek.length})</TabsTrigger>
          <TabsTrigger value="overdue">
            지연 ({overdue.length}) {overdue.length > 0 && <span className="ml-1 text-destructive">🔴</span>}
          </TabsTrigger>
          <TabsTrigger value="assigned">전체 ({assigned.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <TaskListCard tasks={todayList} onToggle={toggle} />
        </TabsContent>
        <TabsContent value="week">
          <TaskListCard tasks={thisWeek} onToggle={toggle} />
        </TabsContent>
        <TabsContent value="overdue">
          <TaskListCard tasks={overdue} onToggle={toggle} highlight />
        </TabsContent>
        <TabsContent value="assigned">
          <TaskListCard tasks={assigned} onToggle={toggle} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskListCard({ tasks, onToggle, highlight }: { tasks: Task[]; onToggle: (id: string) => void; highlight?: boolean }) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">없음 — 잘하고 있습니다 👍</CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-0 divide-y">
        {tasks.map((t) => (
          <div key={t.id} className={`p-3 flex items-start gap-3 hover:bg-accent/30 transition-colors ${highlight ? "bg-destructive/5" : ""}`}>
            <input
              type="checkbox"
              checked={t.status === "DONE"}
              onChange={() => onToggle(t.id)}
              className="mt-1 h-4 w-4 rounded border-input"
            />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${t.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                {t.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                {t.dueAt && <span>마감 {new Date(t.dueAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>}
                {t.relatedAccountName && <span>· {t.relatedAccountName}</span>}
                {t.relatedDealName && <span>· {t.relatedDealName}</span>}
              </div>
            </div>
            <Badge variant={PRIO_COLOR[t.priority]} className="text-xs">{t.priority}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
