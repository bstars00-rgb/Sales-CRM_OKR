"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RotateCw } from "lucide-react";

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
