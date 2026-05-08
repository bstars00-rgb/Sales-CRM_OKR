"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMockSession } from "@/lib/auth/session";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    const s = getMockSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    if (s.role === "SUPER_ADMIN") router.replace("/dashboard/ceo");
    else if (s.role === "SALES_LEAD") router.replace("/dashboard/lead");
    else router.replace("/dashboard/manager");
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center text-muted-foreground">
      이동 중...
    </div>
  );
}
