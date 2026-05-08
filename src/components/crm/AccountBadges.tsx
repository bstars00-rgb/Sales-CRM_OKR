import { Badge } from "@/components/ui/badge";
import type { AccountGrade, AccountSegment, AccountStatus } from "@/lib/mock/types";

const GRADE_LABEL: Record<AccountGrade, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "muted" }> = {
  KEY_ACCOUNT:   { label: "KEY",    variant: "default" },
  GROWTH:        { label: "GROWTH", variant: "success" },
  NEW_PROSPECT:  { label: "NEW",    variant: "warning" },
  DORMANT:       { label: "DORMANT",variant: "destructive" },
  LOW_POTENTIAL: { label: "LOW",    variant: "muted" },
};

const STATUS_LABEL: Record<AccountStatus, string> = {
  PROSPECT: "PROSPECT",
  CONTACTED: "CONTACTED",
  MEETING_DONE: "MEETING DONE",
  PROPOSAL_SENT: "PROPOSAL SENT",
  CONTRACTING: "CONTRACTING",
  API_INTEGRATION: "API INTEGRATION",
  ACTIVE: "ACTIVE",
  DORMANT: "DORMANT",
  LOST: "LOST",
};

const SEGMENT_LABEL: Record<AccountSegment, string> = {
  HOTEL: "HOTEL",
  OTA: "OTA",
  TRAVEL_AGENCY: "TA",
  WHOLESALER: "WHOLESALE",
  DMC: "DMC",
  API_PARTNER: "API PARTNER",
  OFFLINE_AGENT: "OFFLINE",
};

export function GradeBadge({ grade }: { grade: AccountGrade }) {
  const c = GRADE_LABEL[grade];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export function StatusBadge({ status }: { status: AccountStatus }) {
  const variant: "success" | "warning" | "destructive" | "muted" =
    status === "ACTIVE" || status === "API_INTEGRATION"
      ? "success"
      : status === "DORMANT" || status === "LOST"
      ? "destructive"
      : status === "PROSPECT" || status === "CONTACTED"
      ? "muted"
      : "warning";
  return <Badge variant={variant}>{STATUS_LABEL[status]}</Badge>;
}

export function SegmentBadge({ segment }: { segment: AccountSegment }) {
  return <Badge variant="outline">{SEGMENT_LABEL[segment]}</Badge>;
}

export function CountryFlag({ code }: { code: string }) {
  const flag = code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
  return <span className="font-emoji">{flag}</span>;
}

export function RiskDot({ level }: { level: "HIGH" | "MID" | "LOW" }) {
  const color = level === "HIGH" ? "bg-destructive" : level === "MID" ? "bg-warning" : "bg-success";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} aria-label={level} />;
}
