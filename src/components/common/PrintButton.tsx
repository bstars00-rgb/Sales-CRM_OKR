"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

/**
 * 인쇄/PDF 저장 버튼 — 정적 export 환경에서 외부 라이브러리 없이 사용.
 * 브라우저의 인쇄 다이얼로그가 "PDF로 저장" 옵션을 제공.
 */
export function PrintButton({
  label = "인쇄 / PDF 저장",
  variant = "outline",
  size = "sm",
}: {
  label?: string;
  variant?: "outline" | "default" | "ghost";
  size?: "sm" | "default";
}) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
      className="no-print"
      title="브라우저 인쇄 → 대상 'PDF로 저장' 선택"
    >
      <Printer className="h-4 w-4" />{label}
    </Button>
  );
}
