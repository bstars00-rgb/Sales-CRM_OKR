# Sales CRM + OKR

> B2B 호텔/여행 세일즈 조직을 위한 통합 운영 OS — CRM + OKR + KPI + Weekly Sales Brief

## 🎯 무엇인가

호텔 B2B / OTA / 홀세일러 / DMC 세일즈 조직을 위해 **목표(OKR) → 영업 실행(CRM) → 실적/인센티브(KPI) → 보고(Weekly Brief)** 를 한 흐름으로 묶은 세일즈 운영 시스템.

단순 CRM이 아니라 **세일즈 운영 OS**.

## ✨ 주요 기능 (MVP)

- 🏨 **고객사 CRM** — Account / Contact / Deal / Pipeline / Activity / Task
- 🎯 **OKR 3-tier** — 회사 / 팀 / 개인 + Action Plan + Critical 6
- 📊 **KPI & 인센티브** — 실시간 미리보기, 호텔 도메인 1급 (Room Night/GP/ADR)
- 📈 **3개 대시보드** — CEO / Sales Lead / Sales Manager
- 📝 **Weekly Sales Brief** — CRM 데이터 자동 초안 + 5분 컷 작성
- 🌏 **국가 1급 객체** — 담당 국가, 국가별 실적, 출장 모드

## 🛠 기술 스택

| 레이어 | 선택 |
|---|---|
| 프레임워크 | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + Radix UI primitives |
| 차트 | Recharts |
| DB·인증·스토리지 | Supabase (Postgres + Auth + RLS + Storage) |
| ORM | Drizzle ORM |
| 폼·검증 | React Hook Form + Zod |
| 배포 | Vercel + Supabase Cloud |

## 🚀 시작하기

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 (선택 — 프로토타입은 mock data로 동작)
cp .env.example .env.local

# 3) 로컬 실행
npm run dev

# → http://localhost:3000
```

### 시연 계정 (Mock Auth)

프로토타입은 mock 인증으로 동작합니다. 로그인 화면에서 아무 이메일이나 입력하면 다음 역할로 진입:

- `ceo@*` → CEO Dashboard
- `lead@*` → Sales Lead Dashboard
- 그 외 → Sales Manager Dashboard

## 📚 설계 문서

전체 설계는 7편의 문서로 구성됩니다 (Korean):

1. **MVP 설계** — 서비스 정의, 페르소나, 메뉴, 권한, 일정
2. **DB 스키마** — 22개 테이블, ERD, 인덱스, 마이그레이션 순서
3. **CRM 상세** — 7개 화면 UX, 자동 룰, HubSpot 차별점
4. **OKR · KPI · 인센티브** — 13 KPI 정의, 가중치, 시뮬레이션
5. **대시보드** — 5종 보드 + Customer Insight (현장 미팅용)
6. **Weekly Brief** — 자동 초안, 5분 컷, Critical 6 통합
7. **MVP 개발 명세** — 기술 스택, 4주 일정, 파일 구조

## 📁 프로젝트 구조

```
src/
├── app/                   Next.js App Router
│   ├── (auth)/           로그인·온보딩
│   └── (app)/            메인 앱 (인증 보호)
│       ├── dashboard/    역할별 대시보드
│       ├── crm/          고객사·딜·활동
│       ├── okr/          OKR 트리·Critical 6
│       ├── kpi/          KPI·인센티브
│       ├── brief/        주간보고
│       └── tasks/        태스크
├── components/
│   ├── ui/               shadcn-style 베이스
│   ├── layouts/          AppShell, Sidebar, Header
│   ├── crm/              Account·Deal·Activity 위젯
│   ├── okr/              Objective·KR·Critical 6
│   ├── dashboard/        차트 위젯
│   └── brief/            Brief 자동/입력 영역
├── lib/
│   ├── db/               Drizzle schema
│   ├── auth/             세션·권한 RBAC
│   ├── kpi/              집계 공식
│   ├── mock/             프로토타입 mock data
│   └── utils/
└── server/               Server Actions

supabase/
└── migrations/           SQL migrations (10 파일)
```

## 🗺 로드맵

| Phase | 범위 |
|---|---|
| **MVP (4–8주)** | CRM 코어 + 매니저 대시보드 + Brief 개인 |
| **v1.1** | 팀/회사 Brief, 이메일 다이제스트, OKR 트리 |
| **v1.5** | Customer Insight (Customer Mode + PDF), 지도 뷰 |
| **v2** | CFR (Conversation/Feedback/Recognition), Operations Dashboard, 이메일·캘린더 연동 |
| **v3** | AI 추천, 모바일 PWA, 고급 분석 |

## 📜 라이선스

Proprietary — All rights reserved.
