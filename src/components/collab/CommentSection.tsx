"use client";

import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/common/ToastContext";
import { useComments, extractMentions, type CommentRefType } from "@/lib/store/comments";
import { MOCK_TEAM_MEMBERS } from "@/lib/mock/kpi";
import { relativeTime } from "@/lib/utils/format";
import { MessageSquare, Send, Trash2, AtSign } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const CURRENT_USER = { id: "user-mock-1", name: "김민수" }; // mock 세션

export function CommentSection({
  refType,
  refId,
  title = "댓글",
}: {
  refType: CommentRefType;
  refId: string;
  title?: string;
}) {
  const toast = useToast();
  const comments = useComments();
  const [body, setBody] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestQuery, setSuggestQuery] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const list = comments.forRef(refType, refId);

  const allUsers = useMemo(
    () => MOCK_TEAM_MEMBERS.map((m) => ({ id: m.userId, name: m.name })),
    []
  );

  const suggestions = useMemo(() => {
    if (!suggestQuery) return allUsers.slice(0, 6);
    const q = suggestQuery.toLowerCase();
    return allUsers.filter((u) =>
      u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [allUsers, suggestQuery]);

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setBody(v);
    // 커서 직전의 @토큰 감지
    const caret = e.target.selectionStart;
    const beforeCaret = v.slice(0, caret);
    const m = beforeCaret.match(/@([\w가-힣\-]*)$/);
    if (m) {
      setSuggestQuery(m[1]);
      setSuggestOpen(true);
    } else {
      setSuggestOpen(false);
    }
  };

  const insertMention = (name: string) => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    const caret = el.selectionStart;
    const before = body.slice(0, caret).replace(/@([\w가-힣\-]*)$/, `@${name} `);
    const after = body.slice(caret);
    const next = before + after;
    setBody(next);
    setSuggestOpen(false);
    setTimeout(() => {
      el.focus();
      const pos = before.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const mentions = extractMentions(trimmed, allUsers);
    comments.add({
      refType,
      refId,
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.name,
      body: trimmed,
      mentions,
    });
    setBody("");
    if (mentions.length > 0) {
      toast.success("댓글 저장됨", `@${mentions.length}명 멘션 알림 발송`);
    } else {
      toast.success("댓글 저장됨");
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          {title}
          {list.length > 0 && <Badge variant="muted" className="text-xs">{list.length}</Badge>}
        </h3>
      </div>

      {/* 입력 */}
      <div className="space-y-2 relative">
        <textarea
          ref={inputRef}
          value={body}
          onChange={handleBodyChange}
          placeholder="댓글... @를 입력해 팀원 멘션"
          className="w-full min-h-[72px] rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              submit();
            }
            if (e.key === "Escape") setSuggestOpen(false);
          }}
        />
        {/* 자동완성 */}
        {suggestOpen && suggestions.length > 0 && (
          <Card className="absolute z-10 max-w-xs shadow-lg">
            <div className="text-xs text-muted-foreground px-2 py-1.5 border-b flex items-center gap-1">
              <AtSign className="h-3 w-3" />멘션 (Esc 닫기)
            </div>
            <ul>
              {suggestions.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => insertMention(u.name)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 hover:bg-accent text-sm"
                  >
                    <Avatar className="h-5 w-5"><AvatarFallback>{u.name.slice(0, 1)}</AvatarFallback></Avatar>
                    <span className="font-medium">{u.name}</span>
                    <span className="text-xs text-muted-foreground">{u.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            <kbd className="rounded border bg-muted/40 px-1 text-[10px] font-mono">⌘+Enter</kbd> 저장
          </span>
          <Button size="sm" onClick={submit} disabled={!body.trim()}>
            <Send className="h-3.5 w-3.5" />등록
          </Button>
        </div>
      </div>

      {/* 리스트 */}
      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-6">
            첫 댓글을 남겨보세요
          </div>
        ) : (
          list.map((c) => (
            <div key={c.id} className="flex gap-2 group">
              <Avatar className="h-7 w-7 shrink-0"><AvatarFallback>{c.authorName.slice(0, 1)}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium">{c.authorName}</span>
                  <span className="text-muted-foreground">{relativeTime(c.createdAt)}</span>
                  {c.mentions.length > 0 && (
                    <Badge variant="muted" className="text-[9px]">@{c.mentions.length}</Badge>
                  )}
                </div>
                <div className="text-sm mt-0.5 whitespace-pre-wrap break-words">
                  {renderBodyWithMentions(c.body, allUsers)}
                </div>
              </div>
              {c.authorId === CURRENT_USER.id && (
                <button
                  onClick={() => {
                    comments.remove(c.id);
                    toast.warning("댓글 삭제됨");
                  }}
                  aria-label="삭제"
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-destructive shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function renderBodyWithMentions(body: string, users: { id: string; name: string }[]) {
  const parts = body.split(/(@[\w가-힣\-]+)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("@")) {
          const token = p.slice(1);
          const u = users.find((x) => x.id === token || x.name === token || x.id === `user-${token}`);
          if (u) {
            return (
              <span key={i} className={cn("inline-block px-1 rounded bg-primary/10 text-primary font-medium text-xs")}>
                @{u.name}
              </span>
            );
          }
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
