export function formatCurrency(amount: number, currency: string = "KRW"): string {
  if (currency === "KRW") {
    if (amount >= 100_000_000) return `₩${(amount / 100_000_000).toFixed(1)}억`;
    if (amount >= 10_000) return `₩${(amount / 10_000).toFixed(0)}만`;
    return `₩${amount.toLocaleString()}`;
  }
  if (currency === "USD") {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  }
  return `${amount.toLocaleString()} ${currency}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

export function formatPercent(n: number, digits = 0): string {
  return `${n.toFixed(digits)}%`;
}

export function formatDelta(n: number): { sign: string; abs: string; color: string } {
  if (n > 0) return { sign: "▲", abs: `${n.toFixed(0)}%`, color: "text-success" };
  if (n < 0) return { sign: "▼", abs: `${Math.abs(n).toFixed(0)}%`, color: "text-destructive" };
  return { sign: "·", abs: "0%", color: "text-muted-foreground" };
}

export function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const day = 1000 * 60 * 60 * 24;
  const days = Math.floor(diff / day);
  if (days < 1) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "방금";
    return `${hours}시간 전`;
  }
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return `${Math.floor(days / 30)}개월 전`;
}

export function pacingState(achievementPct: number, expectedPacingPct: number): "ok" | "warn" | "bad" {
  if (achievementPct >= expectedPacingPct * 0.95) return "ok";
  if (achievementPct >= expectedPacingPct * 0.75) return "warn";
  return "bad";
}
