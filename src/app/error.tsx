"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RotateCw, MessageCircleQuestion } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  const copyError = () => {
    const txt = `Error: ${error.message}\nDigest: ${error.digest ?? "—"}\nURL: ${typeof window !== "undefined" ? window.location.href : ""}\nUA: ${typeof navigator !== "undefined" ? navigator.userAgent : ""}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(txt);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold tracking-tight mb-2">예기치 못한 오류</h1>
        <p className="text-sm text-muted-foreground mb-1">
          페이지를 로드하던 중 문제가 발생했습니다.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono mb-4">
            ID: {error.digest}
          </p>
        )}

        {/* 에러 메시지 펼침 (개발자용) */}
        <details className="mt-4 text-left text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground inline-block mx-auto">
            기술 정보
          </summary>
          <pre className="mt-2 p-3 rounded bg-muted/50 overflow-x-auto text-[11px] text-left">
            {error.message}
            {error.stack && "\n\n" + error.stack.split("\n").slice(0, 5).join("\n")}
          </pre>
          <Button variant="ghost" size="sm" onClick={copyError} className="mt-2 mx-auto">
            <MessageCircleQuestion className="h-3 w-3" />클립보드에 복사
          </Button>
        </details>

        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" onClick={reset}>
            <RotateCw className="h-4 w-4" />다시 시도
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />홈으로
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
