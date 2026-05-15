"use client";

import dynamic from "next/dynamic";
import { LoadingCard } from "@/components/common/StateCards";
import { getAccountMonthlyRevenue } from "@/lib/mock/revenue";
import type { Account } from "@/lib/mock/types";
import { formatCurrency } from "@/lib/utils/format";

const RevenueLine = dynamic(
  () => import("./AccountRevenueChart.inner").then((m) => m.RevenueLine),
  { ssr: false, loading: () => <LoadingCard label="차트 로딩 중..." className="h-[200px]" /> }
);

export function AccountRevenueChart({ account }: { account: Account }) {
  const data = getAccountMonthlyRevenue(account);
  if (data.length === 0) return null;
  return <RevenueLine data={data} />;
}

export { formatCurrency };
