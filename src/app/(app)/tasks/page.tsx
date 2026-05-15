"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/common/ToastContext";
import { MOCK_TASKS } from "@/lib/mock/activities";
import type { Task } from "@/lib/mock/types";
import { addTask, toggleTask, deleteTask, useSalesVersion } from "@/lib/store/sales-store";
import { Plus, Trash2, X } from "lucide-react";

const PRIO_COLOR: Record<Task["priority"], "destructive" | "warning" | "muted"> = {
  HIGH: "destructive", MED: "warning", LOW: "muted",
};

export default function TasksPage() {
  const version = useSalesVersion();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  void version;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);

  const overdue = MOCK_TASKS.filter((t) => t.dueAt && new Date(t.dueAt) < today && t.status === "TODO");
  const todayList = MOCK_TASKS.filter((t) => {
    if (!t.dueAt) return false;
    const due = new Date(t.dueAt);
    return due >= today && due < new Date(today.getTime() + 86400000) && t.status === "TODO";
  });
  const thisWeek = MOCK_TASKS.filter((t) => {
    if (!t.dueAt) return false;
    const due = new Date(t.dueAt);
    return due >= new Date(today.getTime() + 86400000) && due < endOfWeek && t.status === "TODO";
  });
  const assigned = MOCK_TASKS.filter((t) => t.status === "TODO");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">태스크</h1>
        <Button onClick={() => setFormOpen((o) => !o)}>
          {formOpen ? <><X className="h-4 w-4" />닫기</> : <><Plus className="h-4 w-4" />새 태스크</>}
        </Button>
      </div>

      {formOpen && (
        <NewTaskForm
          onCreate={(t) => {
            addTask(t);
            toast.success("태스크 추가됨", t.title);
            setFormOpen(false);
          }}
          onCancel={() => setFormOpen(false)}
        />
      )}

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
          <TaskListCard tasks={todayList} onToggle={toggleTask} onDelete={(id) => { deleteTask(id); toast.warning("태스크 삭제됨"); }} />
        </TabsContent>
        <TabsContent value="week">
          <TaskListCard tasks={thisWeek} onToggle={toggleTask} onDelete={(id) => { deleteTask(id); toast.warning("태스크 삭제됨"); }} />
        </TabsContent>
        <TabsContent value="overdue">
          <TaskListCard tasks={overdue} onToggle={toggleTask} onDelete={(id) => { deleteTask(id); toast.warning("태스크 삭제됨"); }} highlight />
        </TabsContent>
        <TabsContent value="assigned">
          <TaskListCard tasks={assigned} onToggle={toggleTask} onDelete={(id) => { deleteTask(id); toast.warning("태스크 삭제됨"); }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewTaskForm({
  onCreate, onCancel,
}: {
  onCreate: (t: Omit<Task, "id" | "status">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MED");
  const [channel, setChannel] = useState<Task["channel"] | "NONE">("NONE");
  const [due, setDue] = useState<"today" | "tomorrow" | "week" | "none">("today");

  const submit = () => {
    if (!title.trim()) return;
    const now = new Date();
    let dueAt: string | undefined;
    if (due === "today") {
      now.setHours(18, 0, 0, 0);
      dueAt = now.toISOString();
    } else if (due === "tomorrow") {
      now.setDate(now.getDate() + 1);
      now.setHours(18, 0, 0, 0);
      dueAt = now.toISOString();
    } else if (due === "week") {
      now.setDate(now.getDate() + 7);
      now.setHours(18, 0, 0, 0);
      dueAt = now.toISOString();
    }

    onCreate({
      title: title.trim(),
      ownerUserId: "user-mock-1",
      priority,
      dueAt,
      channel: channel === "NONE" ? undefined : channel,
    });
  };

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="태스크 제목 (예: ABC 견적서 v3 발송)"
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
            <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">🔴 HIGH</SelectItem>
              <SelectItem value="MED">🟡 MED</SelectItem>
              <SelectItem value="LOW">⚪ LOW</SelectItem>
            </SelectContent>
          </Select>

          <Select value={channel} onValueChange={(v) => setChannel(v as Task["channel"] | "NONE")}>
            <SelectTrigger className="w-28 h-9"><SelectValue placeholder="채널" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">채널 없음</SelectItem>
              <SelectItem value="CALL">📞 통화</SelectItem>
              <SelectItem value="MEETING">📅 미팅</SelectItem>
              <SelectItem value="EMAIL">✉ 이메일</SelectItem>
              <SelectItem value="MESSENGER">💬 메신저</SelectItem>
            </SelectContent>
          </Select>

          <Select value={due} onValueChange={(v) => setDue(v as typeof due)}>
            <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">오늘 18시</SelectItem>
              <SelectItem value="tomorrow">내일 18시</SelectItem>
              <SelectItem value="week">1주일 후</SelectItem>
              <SelectItem value="none">마감 없음</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={onCancel}>취소</Button>
            <Button size="sm" onClick={submit} disabled={!title.trim()}>
              <Plus className="h-4 w-4" />추가
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskListCard({
  tasks, onToggle, onDelete, highlight,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  highlight?: boolean;
}) {
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
          <div
            key={t.id}
            className={`p-3 flex items-start gap-3 hover:bg-accent/30 transition-colors group ${
              highlight ? "bg-destructive/5" : ""
            }`}
          >
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
                {t.dueAt && (
                  <span>
                    마감 {new Date(t.dueAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                {t.relatedAccountName && <span>· {t.relatedAccountName}</span>}
                {t.relatedDealName && <span>· {t.relatedDealName}</span>}
                {t.channel && <span>· {t.channel}</span>}
              </div>
            </div>
            <Badge variant={PRIO_COLOR[t.priority]} className="text-xs shrink-0">{t.priority}</Badge>
            <button
              onClick={() => onDelete(t.id)}
              aria-label="삭제"
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-destructive shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
