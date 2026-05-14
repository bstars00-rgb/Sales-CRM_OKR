"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw, ArrowLeft } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-1">화면을 표시할 수 없습니다</h2>
          <p className="text-sm text-muted-foreground mb-1">
            이 화면에서 오류가 발생했습니다. 다른 화면은 정상 동작합니다.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {error.digest}
            </p>
          )}
          <div className="flex justify-center gap-2 mt-5">
            <Button variant="outline" onClick={reset} size="sm">
              <RotateCw className="h-4 w-4" />다시 시도
            </Button>
            <Button asChild size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />대시보드로
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
