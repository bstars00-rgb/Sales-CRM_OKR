"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { setMockSession, authenticateMock, MOCK_ACCOUNTS } from "@/lib/auth/session";
import { ROLE_LABEL, ROLE_DESCRIPTION } from "@/lib/auth/types";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enter = (em: string, pw: string) => {
    setError(null);
    setSubmitting(true);
    const session = authenticateMock(em, pw);
    if (!session) {
      setError("이메일 또는 패스워드가 올바르지 않습니다.");
      setSubmitting(false);
      return;
    }
    setMockSession(session);
    setTimeout(() => router.push("/"), 150);
  };

  const quickLogin = (em: string) => {
    setEmail(em);
    setPassword("demo1234");
    enter(em, "demo1234");
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            S
          </span>
          <Badge variant="muted">Prototype</Badge>
        </div>
        <CardTitle className="text-2xl">Sales CRM + OKR</CardTitle>
        <CardDescription>
          B2B 호텔/여행 세일즈 운영 OS — 이메일과 패스워드로 로그인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email && password) enter(email, password);
          }}
          className="space-y-3"
        >
          <div>
            <label htmlFor="email" className="text-sm font-medium block mb-1.5">이메일</label>
            <Input
              id="email"
              type="email"
              placeholder="email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium block mb-1.5">패스워드</label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="demo1234"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "패스워드 숨기기" : "패스워드 보기"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-xs text-destructive flex items-center gap-1.5 bg-destructive/5 border border-destructive/30 rounded-md p-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={submitting || !email || !password}>
            {submitting ? "확인 중..." : "로그인"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">빠른 시연 계정</span>
          </div>
        </div>

        <div className="space-y-2">
          {MOCK_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              onClick={() => quickLogin(a.email)}
              disabled={submitting}
              className="w-full flex items-center justify-between rounded-md border bg-background hover:bg-accent transition-colors px-3 py-2.5 text-left disabled:opacity-50"
            >
              <div>
                <div className="font-medium text-sm">{a.user.name}</div>
                <div className="text-xs text-muted-foreground">{a.email}</div>
                <div className="text-[10px] text-muted-foreground/80 mt-0.5">
                  {ROLE_DESCRIPTION[a.user.role]}
                </div>
              </div>
              <Badge variant="outline">{ROLE_LABEL[a.user.role]}</Badge>
            </button>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          시연 패스워드: <code className="font-mono">demo1234</code>
          <br />
          ELLIS 연동 시 SSO/OAuth로 교체 예정.
        </p>
      </CardContent>
    </Card>
  );
}
