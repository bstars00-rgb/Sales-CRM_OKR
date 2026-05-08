# ELLIS 어댑터 레이어

ELLIS 어드민/백엔드 시스템과의 통신을 담당.

## 책임 구분

```
ELLIS (Source of Truth)
  ├─ users (identity)
  ├─ accounts (고객사)
  ├─ contacts (담당자)
  ├─ deals
  ├─ revenue / GP / room nights
  └─ hotels / products / countries

우리 자체 DB (Supabase)
  ├─ organizations / departments / teams
  ├─ users (ELLIS의 user_id 미러 + team/role 매핑)
  ├─ objectives / key_results / action_plans / critical_six
  ├─ kpi_definitions / kpi_targets / kpi_actuals
  ├─ incentive_rules / incentive_payouts
  ├─ activities / tasks (영업 활동 — 우리에서 신규)
  └─ weekly_reports / brief_comments
```

## 사용 패턴

```ts
// 호출자
import { fetchAccounts } from "@/lib/ellis/accounts";

const accounts = await fetchAccounts({ ownerUserId: me.id, limit: 50 });
```

내부적으로 `ellisFetch()` 가 인증 헤더를 주입하고 응답을 mapper로 변환.

## 환경 변수

```bash
NEXT_PUBLIC_ELLIS_API_URL=https://ellis.your-domain.com
```

인증 토큰은 현재 임시로 `localStorage['ellis-token']`. 향후 결정:
- Supabase Auth 토큰을 ELLIS가 검증
- 또는 ELLIS의 자체 SSO/JWT 발급

## 도메인 매핑 (TODO — ELLIS 스펙 확정 후)

| 우리 타입 | ELLIS endpoint (예상) | mapper |
|---|---|---|
| `Account` | `GET /api/accounts` | `mapEllisAccount()` |
| `Contact` | `GET /api/contacts` | `mapEllisContact()` |
| `Deal` | `GET /api/deals` | `mapEllisDeal()` |
| `revenue snapshot` | `GET /api/revenue?account_id=...` | `mapEllisRevenue()` |
