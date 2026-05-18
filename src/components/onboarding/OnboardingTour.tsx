"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard, Building2, Briefcase, Target, FileText, Bell,
  ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2, Hotel, Calendar,
} from "lucide-react";

const STORAGE_KEY = "sales-crm-onboarded";

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  bullets: string[];
  href?: string;
  cta?: string;
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "환영합니다 👋",
    description: "호텔 B2B / OTA / 홀세일러 / DMC 영업을 위한 사내 통합 운영 도구입니다.",
    bullets: [
      "🎯 OKR → 영업 실행(CRM) → KPI/인센티브 → 주간보고 한 흐름",
      "🌙 다크모드 기본, ⌘K 전역 검색, 🔔 자동 알림",
      "🌐 22개 고객사 · 28개 딜 · 10개국 mock 데이터로 즉시 시연 가능",
    ],
  },
  {
    icon: LayoutDashboard,
    title: "1. 내 대시보드부터 확인",
    description: "오늘 해야할 일이 한눈에 보이는 시작 화면.",
    bullets: [
      "KPI 6 카드 (Revenue/GP/Meetings/Proposals...) 실시간 합산",
      "Critical 6 — 이번 주 반드시 해낼 일 자동 추천 + 체크",
      "14일 미접촉 KEY 고객사 알림",
    ],
    href: "/dashboard/manager",
    cta: "내 대시보드 열기",
  },
  {
    icon: Building2,
    title: "2. 고객사 → 상세 → 인사이트",
    description: "Account 카탈로그에서 호텔/OTA/여행사를 관리.",
    bullets: [
      "9컬럼 정렬 · 필터 · ⭐ 즐겨찾기 · CSV 17컬럼",
      "상세 5탭: 개요/담당자/딜/활동/메모 + 24개월 차트",
      "[📊 미팅 모드] = Room Night/ADR/시즌성 6장 슬라이드",
    ],
    href: "/crm/accounts",
    cta: "고객사 보기",
  },
  {
    icon: Briefcase,
    title: "3. 딜 칸반 + Forecast",
    description: "드래그앤드롭으로 단계 이동, 확률 가중 매출 예측까지.",
    bullets: [
      "8단계 OPEN 칸반 + WON/LOST + 단계 평균 체류일",
      "카드 인라인 편집 (금액·클로징일) + 즐겨찾기",
      "Pipeline Forecast: Worst/Likely/Best 시나리오 + 월별 분포",
    ],
    href: "/crm/deals/kanban",
    cta: "딜 칸반 열기",
  },
  {
    icon: Hotel,
    title: "4. 호텔 도메인 지표",
    description: "RevPAR · ADR · Room Night · 시즌성 캘린더.",
    bullets: [
      "이번달 KPI 4종 + MoM 델타",
      "통화 토글 (KRW/USD/JPY/VND) — 즉시 환산",
      "12개월 시즌성 캘린더 (성수기/비수기 음영)",
    ],
    href: "/crm/hotel-metrics",
    cta: "호텔 지표 열기",
  },
  {
    icon: Target,
    title: "5. OKR 자동 진척",
    description: "9개 Objective의 KR 진척률이 CRM 데이터에서 자동 계산.",
    bullets: [
      "회사 2 + 팀 3 + 개인 4 = 9 Objective",
      "9개 KR에 ✨ AUTO 배지 — 활동/딜 변경 시 즉시 반영",
      "Critical 6 자동 추천 + 분기 회고 (Google 가이드 점수)",
    ],
    href: "/okr",
    cta: "OKR 열기",
  },
  {
    icon: FileText,
    title: "6. 주간 Brief",
    description: "개인 → 팀 → 회사 3단위 자동 합산.",
    bullets: [
      "모든 숫자가 mock에서 실시간 계산",
      "OKR 진척 자동 삽입 + 초안 재집계 버튼",
      "제출 시 다음 주 Critical 6 자동 교체",
    ],
    href: "/brief",
    cta: "Brief 열기",
  },
  {
    icon: Bell,
    title: "7. 알림 / 설정 / 단축키",
    description: "헤더 종 아이콘 + 설정 메뉴 + ⌘K 전역 검색.",
    bullets: [
      "🔔 4종 알림: 미접촉/딜정체/태스크지연/계약갱신 임박",
      "⚙ 알림 룰 직접 설정, 백업/복원, CSV 가져오기",
      "⌘K — 172개 엔티티 즉시 검색",
    ],
    href: "/settings/notifications",
    cta: "알림 룰 설정",
  },
];

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = window.localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // 페이지 로드 후 약간의 지연 (불쾌한 즉시 팝업 방지)
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  // 글로벌 헬프 이벤트 — 다른 곳에서 강제로 열 수 있도록
  useEffect(() => {
    const handler = () => { setStep(0); setOpen(true); };
    if (typeof window !== "undefined") {
      window.addEventListener("sales-crm:open-onboarding", handler);
      return () => window.removeEventListener("sales-crm:open-onboarding", handler);
    }
  }, []);

  const markDone = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    }
    setOpen(false);
  };

  const cur = STEPS[step];
  const Icon = cur.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) markDone(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>온보딩 투어 · {step + 1} / {STEPS.length}</span>
            </div>
            <button
              onClick={markDone}
              aria-label="닫기"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogTitle className="flex items-center gap-2 mt-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            {cur.title}
          </DialogTitle>
          <DialogDescription>{cur.description}</DialogDescription>
        </DialogHeader>

        <Card className="bg-muted/30">
          <CardContent className="p-3 space-y-2">
            {cur.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 진척 도트 */}
        <div className="flex justify-center gap-1.5 pt-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`단계 ${i + 1}로 이동`}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        {/* 하단 액션 */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={isFirst}
          >
            <ArrowLeft className="h-4 w-4" />이전
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={markDone}>
              건너뛰기
            </Button>
            {cur.href && (
              <Button variant="outline" size="sm" asChild>
                <Link href={cur.href} onClick={markDone}>
                  <Calendar className="h-4 w-4" />{cur.cta ?? "열기"}
                </Link>
              </Button>
            )}
            {!isLast ? (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                다음<ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={markDone}>
                <CheckCircle2 className="h-4 w-4" />시작하기
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
