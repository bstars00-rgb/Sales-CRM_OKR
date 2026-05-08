# Sales CRM + OKR

> 호텔 B2B / 여행 세일즈 조직을 위한 **사내 도구** — CRM + OKR + KPI + Weekly Sales Brief

## 🎯 무엇인가

호텔 B2B / OTA / 홀세일러 / DMC 세일즈 조직을 위해 **목표(OKR) → 영업 실행(CRM) → 실적/인센티브(KPI) → 보고(Weekly Brief)** 를 한 흐름으로 묶은 사내 운영 도구.

**SaaS가 아닌 단일 인스턴스 사내 도구**. 데이터는 기존 운영 중인 ELLIS 시스템에서 가져옴.

## 🏗 아키텍처

```
┌──────────────────────────────────────────────┐
│  Next.js (정적 export, GitHub Pages)         │
│  - 화면, 차트, 시연용 mock                    │
└────────┬─────────────────────────────────────┘
         │ REST (browser fetch)
         ▼
   ┌──────────────┐
   │  ELLIS API   │  ← 사용자, 고객사, 딜, 매출 (Source of Truth)
   └──────────────┘

ELLIS에 없는 데이터 (OKR / Critical 6 / KPI 운영 / Brief 등)
  → 명세서(spec/db-schema/*.sql)에 정의만, 실제 저장 X
  → 향후 ELLIS 팀이 흡수 또는 별도 결정
```

| 인프라 | 사용 |
|---|---|
| 호스팅 | GitHub Pages 정적 export |
| CI/CD | GitHub Actions |
| 데이터 | ELLIS REST API |
| 외부 PaaS | 사용 안 함 (Supabase·Vercel·Neon 모두 X) |

## ✨ 화면

- 🏨 **CRM** — 고객사 리스트·상세 / 딜 칸반 / 활동 타임라인 / 태스크
- 🎯 **OKR** — 회사·팀·개인 3-tier + Action Plan + Critical 6
- 📊 **KPI · 인센티브** — 시뮬레이터, 가중평균, 단계별 차트
- 📈 **3개 대시보드** — CEO / Sales Lead / Sales Manager
- 📝 **Weekly Brief** — 자동 영역 + 사용자 입력 + 추천 알고리즘 (시연용)
- 🌙 **다크모드** — 기본값 (light/system 토글)

## 🛠 기술 스택

| 레이어 | 선택 |
|---|---|
| 프레임워크 | Next.js 15 (App Router) + TypeScript |
| 출력 | 정적 export (`output: 'export'`) |
| UI | Tailwind CSS + Radix UI primitives |
| 차트 | Recharts |
| 폼·검증 | React Hook Form + Zod (예정) |
| 배포 | GitHub Pages (자동 워크플로우) |

## 🚀 시작하기

```bash
# 의존성
npm install

# 로컬 실행
npm run dev
# → http://localhost:3000

# 정적 빌드 확인
npm run build
```

### 시연 계정 (Mock 인증 — 비밀번호 검증 없음)

- `manager@demo.com` → Sales Manager 대시보드
- `lead@demo.com` → Sales Lead 대시보드
- `ceo@demo.com` → CEO 대시보드

## 📁 프로젝트 구조

```
src/
├── app/                   Next.js App Router (15 화면)
│   ├── (auth)/           로그인
│   └── (app)/            인증 후 메인 (대시보드·CRM·OKR·KPI·Brief)
├── components/
│   ├── ui/               shadcn-style 베이스
│   ├── layouts/          AppShell, Sidebar, Header
│   ├── theme/            다크모드 Provider + 토글
│   ├── crm/              Account·Deal·Activity 위젯
│   └── dashboard/        차트·KPI 카드
├── lib/
│   ├── auth/             mock 세션
│   ├── ellis/            ELLIS REST 어댑터 (스켈레톤 — 스펙 후 구현)
│   ├── theme/            테마 전환·FOUC 방지 스크립트
│   ├── mock/             시연용 mock data
│   └── utils/

spec/
└── db-schema/            ELLIS에 없는 도메인의 데이터 모델 명세 (SQL DDL)

.github/workflows/
└── deploy.yml            push마다 GitHub Pages로 자동 배포
```

## 📚 설계 문서 (7편)

대화 히스토리로 작성된 한국어 설계 문서:

1. **MVP 설계** — 서비스 정의, 페르소나, 메뉴, 권한
2. **DB 스키마** — 22개 테이블, ERD, 인덱스 (`spec/db-schema/`로 일부 동결)
3. **CRM 상세** — 7개 화면 UX, 자동 룰, HubSpot 차별점
4. **OKR · KPI · 인센티브** — 13 KPI 정의, 가중치, 시뮬레이션
5. **대시보드** — 5종 보드 + Customer Insight (현장 미팅용)
6. **Weekly Brief** — 자동 초안, 5분 컷, Critical 6 통합
7. **MVP 개발 명세** — 기술 스택, 일정, 파일 구조

## 🗺 로드맵

| Phase | 범위 |
|---|---|
| ✅ **v0.1 (현재)** | 정적 프로토타입 — 모든 화면, mock data, 다크모드, 깃 자동 배포 |
| **v0.2** | Customer Insight 풀스크린, Activity 30초 위저드, Deal 상세 |
| **v0.3 (ELLIS 스펙 확보 후)** | ELLIS REST 어댑터 구현 → 고객사·딜·매출 실제 연동 |
| **v1.0** | ELLIS 팀과 OKR/Brief 흡수 협의 또는 별도 결정 |

## 📜 라이선스

Internal use only.
