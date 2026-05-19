export type AccountSegment =
  | "HOTEL" | "OTA" | "TRAVEL_AGENCY" | "WHOLESALER" | "DMC" | "API_PARTNER" | "OFFLINE_AGENT";

export type AccountGrade = "KEY_ACCOUNT" | "GROWTH" | "NEW_PROSPECT" | "DORMANT" | "LOW_POTENTIAL";

export type AccountStatus =
  | "PROSPECT" | "CONTACTED" | "MEETING_DONE" | "PROPOSAL_SENT"
  | "CONTRACTING" | "API_INTEGRATION" | "ACTIVE" | "DORMANT" | "LOST";

export type DealOutcome = "OPEN" | "WON" | "LOST";

export type DealType =
  | "NEW" | "RENEWAL" | "UPSELL" | "API_INTEGRATION"
  | "HOTEL_SUPPLY" | "TICKET_SUPPLY" | "CO_PROMOTION";

export type ActivityType =
  | "NOTE" | "CALL" | "MEETING" | "EMAIL_LOG" | "MESSENGER"
  | "PROPOSAL_SENT" | "CONTRACT_SENT" | "FOLLOW_UP"
  | "CUSTOMER_REQUEST" | "INTERNAL_REQUEST";

export type RiskLevel = "HIGH" | "MID" | "LOW";

export interface Account {
  id: string;
  name: string;
  segment: AccountSegment;
  grade: AccountGrade;
  status: AccountStatus;
  countryCode: string;
  countryName: string;
  city: string;
  ownerUserId: string;
  ownerName: string;
  lastActivityAt: string;
  nextActionAt?: string;
  nextActionTitle?: string;
  revenue3M: number;
  gp3M: number;
  pipelineAmount: number;
  riskLevel: RiskLevel;
  growthPotential: RiskLevel;
  totalRevenueYtd: number;
  totalGpYtd: number;
  firstContactDate: string;
}

export interface Contact {
  id: string;
  accountId: string;
  firstName: string;
  lastName?: string;
  title?: string;
  email?: string;
  phone?: string;
  messengerKind?: "KAKAO" | "WHATSAPP" | "LINE" | "ZALO" | "WECHAT";
  messengerId?: string;
  decisionPower: number;
  influence: number;
  relationshipTemp: "COLD" | "COOL" | "WARM" | "HOT";
  isPrimary: boolean;
}

export interface Deal {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  ownerUserId: string;
  ownerName: string;
  dealType: DealType;
  outcome: DealOutcome;
  amount: number;
  expectedGp: number;
  currency: string;
  probabilityPct: number;
  expectedCloseDate: string;
  stageId: string;
  stageName: string;
  stageOrder: number;
  daysInStage: number;
  countryCode: string;
  grade: AccountGrade;
  blockers?: { title: string; severity: "LOW" | "MID" | "HIGH" }[];
  winReasonCode?: string;
  lostReasonCode?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  orderNo: number;
  stageKind: "OPEN" | "WON" | "LOST";
  probabilityDefault: number;
}

export interface Activity {
  id: string;
  activityType: ActivityType;
  userId: string;
  userName: string;
  accountId?: string;
  accountName?: string;
  dealId?: string;
  dealName?: string;
  contactId?: string;
  contactName?: string;
  occurredAt: string;
  durationMinutes?: number;
  subject?: string;
  content?: string;
  outcome?: string;
  nextAction?: string;
}

export interface Task {
  id: string;
  title: string;
  ownerUserId: string;
  relatedAccountId?: string;
  relatedAccountName?: string;
  relatedDealId?: string;
  relatedDealName?: string;
  dueAt?: string;
  priority: "LOW" | "MED" | "HIGH";
  status: "TODO" | "DOING" | "DONE" | "CANCELLED";
  channel?: "CALL" | "EMAIL" | "MEETING" | "MESSENGER";
  completedAt?: string;
}

export interface KpiCard {
  code: string;
  label: string;
  unit: string;
  current: number;
  target: number;
  achievementPct: number;
  yoyDelta?: number;
  baseline?: number;
}

export interface Critical6Item {
  title: string;
  linkedDealId?: string;
  linkedDealName?: string;
  linkedKrId?: string;
  by?: string;
  done: boolean;
  /** 이 항목 소유자 (페르소나 가시성 필터용) */
  ownerUserId?: string;
}

export interface Objective {
  id: string;
  title: string;
  ownerKind: "COMPANY" | "TEAM" | "USER";
  ownerName: string;
  /** ownerKind=USER이면 userId, ownerKind=TEAM이면 teamId, COMPANY이면 "company" */
  ownerId?: string;
  periodLabel: string;
  progressPct: number;
  keyResults: KeyResult[];
}

export interface KeyResult {
  id: string;
  title: string;
  metricKind: "NUMBER" | "CURRENCY" | "PERCENT" | "BOOLEAN";
  targetValue: number;
  currentValue: number;
  unit?: string;
  progressPct: number;
}

export interface TeamMember {
  userId: string;
  name: string;
  role: string;
  revenueAchievementPct: number;
  gpAchievementPct: number;
  meetings: number;
  proposals: number;
  winRate: number;
  briefRate: number;
  critical6Done: number;
  critical6Total: number;
  pacing: "ok" | "warn" | "bad";
  alerts: string[];
}
