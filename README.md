# Sales CRM + OKR

> 호텔 B2B / 여행 세일즈 조직을 위한 **사내 도구** — CRM + OKR + KPI + Weekly Sales Brief

🌐 **라이브**: https://bstars00-rgb.github.io/Sales-CRM_OKR/

## 🎯 무엇인가

호텔 B2B / OTA / 홀세일러 / DMC 세일즈 조직을 위해 **목표(OKR) → 영업 실행(CRM) → 실적/인센티브(KPI) → 보고(Weekly Brief)** 를 한 흐름으로 묶은 사내 운영 도구.

**SaaS가 아닌 단일 인스턴스 사내 도구**. 데이터는 기존 운영 중인 ELLIS 시스템에서 가져옴 (연동 대기).

## 🏗 아키텍처

```
┌──────────────────────────────────────────────┐
│  Next.js 15 (정적 export, GitHub Pages)      │
│  - App Router · TypeScript strict · React 19 │
│  - useSyncExternalStore 기반 reactive store  │
└────────┬─────────────────────────────────────┘
         │ REST (browser fetch)
         ▼
   ┌──────────────┐
   │  ELLIS API   │  ← 사용자, 고객사, 딜, 매출 (대기 중)
   └──────────────┘

ELLIS에 없는 데이터 (OKR / Critical 6 / KPI 운영 / Brief 등)
  → 명세서(spec/db-schema/*.sql)에 정의만, 실제 저장 X
  → 현재는 mock data로 모든 흐름 시연 가능
```

## ✨ 주요 기능

### CRM
- 🏨 **22개 고객사 / 55명 담당자 / 28개 딜** (10개국 분포)
- **고객사 리스트**: 9컬럼 정렬 + 필터 + 페이징 + ⭐ 즐겨찾기 + CSV 내보내기
- **고객사 상세**: Hero + 5탭 (개요/담당자/딜/활동/메모) + 24개월 매출 차트 + 인라인 활동 기록
- **Customer Insight 풀스크린**: 미팅용 6장 슬라이드 (호텔 도메인 — Room Night/ADR/시즌성)
- **딜 칸반**: 드래그앤드롭 단계 이동 + 인라인 편집 (금액/클로징일) + 단계별 평균 체류일·정체 통계
- **딜 상세**: 단계 진행 막대 + Win/Lost 모달 (사유 코드 강제)
- **활동 30초 위저드**: 채널·결과·메모·다음액션 + 음성 받아쓰기 (Web Speech API) + 모바일 풀스크린
- **태스크**: 4탭 (오늘/이번주/지연/전체) + 인라인 추가 + 우선순위·채널·마감

### OKR
- **9개 Objective** (회사 2 + 팀 3 + 개인 4)
- **자동 진척률** — 9개 KR이 CRM 데이터에서 자동 계산 (✨ AUTO 배지)
- **OKR 트리** — 회사 → 팀 → 개인 cascade 시각화
- **Objective 상세** + Action Plan (TODO → DOING → DONE 순환)
- **Critical 6**: 자동 추천 8건 (이월·정체딜·미접촉KEY·큰OPEN·지연태스크·고정)
- **분기 회고** — Google OKR 가이드 점수 (60-80% 이상적)

### KPI · 인센티브
- **6개 KPI** (REVENUE/GP/NEW/MEETINGS/PROPOSALS/CONTRACTS)
- **실시간 인센티브 미리보기** — WON 딜 추가 시 즉시 갱신
- **인센티브 룰 편집** (LEAD+ 권한)

### 대시보드
- **Manager**: KPI 6 + 오늘 태스크 + Critical 6 + 미접촉 KEY
- **Lead**: 4팀 탭 + 멤버 KPI 매트릭스 + 정체 딜 (모바일 카드뷰)
- **CEO**: YTD 합산 + 12개월 추이 + 10개국 막대 + TOP 15 + 위험 신호

### Weekly Brief
- **개인 / 팀 / 회사** 3 단위
- **자동 합산** — 모든 숫자가 mock 데이터에서 실시간 계산
- **OKR 진척 자동 삽입** + 초안 재집계 버튼
- **다음주 Critical 6 자동 생성** — 제출 시 교체
- 자동 저장 indicator (1.5s debounce)

### UI / UX
- 🌙 **다크모드 기본** (light / system 토글)
- 🔍 **Cmd+K 전역 검색** — 172개 엔티티 (계정/딜/담당자/활동/태스크/OKR/페이지)
- 🔔 **알림 센터** — 자동 감지 + 읽음/안읽음 + 분해 모달
- 🍞 **Toast** — 우하단 + 최대 4개 큐 + 자동 정리
- ✨ Cross-screen reactivity — Activity 저장 → KPI/Lead/CEO/Brief 자동 갱신

## 🛠 기술 스택

| 레이어 | 선택 |
|---|---|
| 프레임워크 | Next.js 15.5 (App Router) + TypeScript 5.6 |
| 출력 | 정적 export (`output: 'export'`) |
| UI | Tailwind CSS + Radix UI primitives |
| 차트 | Recharts (lazy load) |
| 상태 | useSyncExternalStore (외부 의존성 0) |
| 다크모드 | FOUC 방지 인라인 스크립트 |
| 인쇄 | window.print + 인쇄 CSS |
| 테스트 | Vitest (단위 39) + Playwright (e2e 9) |
| 배포 | GitHub Pages (Actions 자동) |

## 🚀 시작하기

```bash
# 1) 의존성
npm install

# 2) 로컬 실행
npm run dev
# → http://localhost:3000

# 3) 테스트
npm test          # 단위 (39 tests, ~0.6s)
npm run test:e2e  # e2e (9 tests, ~8s)

# 4) 정적 빌드
npm run build         # production (basePath /Sales-CRM_OKR)
npm run build:test    # test용 (basePath 없음)
```

### 시연 계정 (Mock 인증)

- `manager@demo.com` → Sales Manager 대시보드 (김민수)
- `lead@demo.com`    → Sales Lead 대시보드 (박상무)
- `ceo@demo.com`     → CEO 대시보드 (정대표)

## 🎬 시연 시나리오 (5분)

```
1. /login → manager@demo.com 클릭
2. /dashboard/manager → KPI 6 카드 + Critical 6 + 14일 미접촉
3. /crm/accounts → "ABC Travel" 클릭
4. /crm/accounts/acc-001
   → 우측 [⚡ 빠른 활동 기록] → 통화 → 메모 → 저장
   → 활동 타임라인 NEW 하이라이트 자동
   → [📊 미팅 모드] → Customer Insight 6장 슬라이드
5. /crm/deals/kanban
   → 카드 드래그 → "Won" 컬럼 drop
   → Toast: "Critical 6 자동 완료"
6. /kpi → 인센티브 ↑ 즉시 반영
7. /okr/critical-six → 자동 추천 → 6개 선택 → 확정
8. /brief → [초안 재집계] → [제출] → 다음주 C6 교체
9. /okr/retro → 분기 회고 점수 확인
10. ⌘K → "베트남" 입력 → 다국가 검색 결과
```

## 📊 프로젝트 규모

```
30+ commits
~90 source files (TS+TSX)
~12,000 lines of code
30 page directories  
32 components
24 lib modules
48 자동 테스트 (39 unit + 9 e2e)
93+ static pages (동적 [id] 포함)
```

## 📁 프로젝트 구조

```
src/
├── app/                        Next.js App Router
│   ├── (auth)/                로그인
│   └── (app)/                 메인 앱
│       ├── dashboard/         Manager / Lead / CEO
│       ├── crm/               Accounts / Deals / Activities / Insight
│       ├── okr/               리스트 / 트리 / Critical 6 / 회고 / 상세
│       ├── kpi/               시뮬레이터 + 인센티브 룰
│       ├── brief/             개인 / 팀 / 회사
│       └── tasks/
├── components/
│   ├── ui/                    shadcn-style 베이스 (Button/Card/Input/Dialog 등)
│   ├── layouts/               AppShell + Sidebar + Header + CommandK + NotificationBell
│   ├── theme/                 다크모드 Provider + Toggle
│   ├── common/                StateCards + ToastContext
│   ├── crm/                   AccountBadges + ActivityWizard + InlineActivityForm + MemoPanel
│   └── dashboard/             KpiCard + CeoCharts
├── lib/
│   ├── store/                 sales-store (mutators) + favorites
│   ├── auth/                  mock 세션
│   ├── ellis/                 REST 어댑터 (스켈레톤 — ELLIS 스펙 후)
│   ├── kpi/                   computeIncentive
│   ├── okr/                   auto-progress + next-critical-six
│   ├── brief/                 aggregate (팀/회사)
│   ├── team/                  computed members
│   ├── theme/                 FOUC 방지 스크립트
│   ├── mock/                  시드 데이터 (계정/딜/활동/...)
│   └── utils/                 cn / format / csv

tests/
├── unit/                      Vitest (39 tests)
│   ├── sales-store.test.ts
│   └── compute.test.ts
└── e2e/                       Playwright (9 tests)
    └── smoke.spec.ts

spec/
└── db-schema/                 ELLIS에 없는 도메인의 DDL 명세 (참고)

.github/workflows/
└── deploy.yml                 typecheck → unit test → build:test → e2e → build → deploy
```

## 🗺 로드맵

| Phase | 범위 | 상태 |
|---|---|---|
| ✅ **v0.1** | UI 프로토타입 — 모든 화면, mock data | 완료 |
| ✅ **v0.2** | Cross-screen reactivity, e2e CI, 48 자동 테스트 | 완료 |
| ✅ **v0.3** | CSV / 즐겨찾기 / 단계 통계 / 분기 회고 | 완료 |
| ⏳ **v0.4** | ELLIS REST API 통합 (스펙 수령 대기) | 대기 |
| **v1.0** | ELLIS 실 데이터로 mock 점진 교체 + 인증 통합 | 계획 |

## 📜 라이선스

Internal use only.
