"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { setMockSession, buildSessionFromEmail } from "@/lib/auth/session";

const QUICK_ACCOUNTS = [
  { email: "manager@demo.com",  name: "김민수",  role: "Sales Manager" },
  { email: "lead@demo.com",     name: "박상무",  role: "Sales Lead" },
  { email: "ceo@demo.com",      name: "정대표",  role: "CEO / Admin" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const enter = (em: string, nm?: string) => {
    setSubmitting(true);
    const session = buildSessionFromEmail(em, nm);
    setMockSession(session);
    setTimeout(() => router.push("/"), 200);
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
          B2B 호텔/여행 세일즈 운영 OS — 로그인 후 시작합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) enter(email, name);
          }}
          className="space-y-3"
        >
          <div>
            <label className="text-sm font-medium block mb-1.5">이메일</label>
            <Input
              type="email"
              placeholder="email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">이름 (선택)</label>
            <Input
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "이동 중..." : "로그인"}
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
          {QUICK_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              onClick={() => enter(a.email, a.name)}
              className="w-full flex items-center justify-between rounded-md border bg-background hover:bg-accent transition-colors px-3 py-2.5 text-left"
            >
              <div>
                <div className="font-medium text-sm">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.email}</div>
              </div>
              <Badge variant="outline">{a.role}</Badge>
            </button>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          프로토타입은 mock 인증으로 동작합니다. 실제 비밀번호는 검증하지 않습니다.
        </p>
      </CardContent>
    </Card>
  );
}
