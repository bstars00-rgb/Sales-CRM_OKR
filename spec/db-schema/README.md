# DB Schema 명세서

> ⚠️ **이 SQL 파일들은 실제 배포 대상이 아닙니다.** 명세서·문서 역할만 합니다.

## 위치 / 의도

이 프로젝트는 **자체 DB를 운영하지 않습니다**. 데이터 소스는:

- 비즈니스 데이터 (사용자·고객사·딜·매출) → **ELLIS REST API**
- ELLIS에 없는 데이터 (조직/팀, OKR, KPI 운영 메타, Brief 등) → **명세서에만 정의**

이 폴더의 SQL은 다음을 위한 **schema spec**:

1. 신규 도메인의 데이터 모델을 코드 형태로 동결
2. 향후 ELLIS 팀이 새 테이블·엔드포인트를 추가할 때 참고할 **확장 제안서**
3. UI(mock data)와 도메인 모델의 일관성 유지

> 폴더 이름은 `spec/db-schema/`이지만 PostgreSQL DDL 문법으로 작성됨 — 단순히 표준 SQL이 표현력이 좋아서 사용. Supabase·Postgres 의존 X.

## 파일 구성

| 파일 | 명세 대상 | ELLIS 보유 여부 |
|---|---|---|
| `0001_init_extensions.sql` | UUID·트리거 헬퍼 등 (Postgres 가정) | — |
| `0010_org_user.sql` | 조직·부서·팀·사용자·국가 매핑 | 사용자만 ELLIS에 있음. 나머지는 신규 |
| `0020_okr.sql` | Objectives / KR / Action Plan / Critical 6 | ❌ 신규 |
| `0030_kpi.sql` | KPI 정의·목표·실적·인센티브 룰 | 부분: 실적 계산 raw는 ELLIS, 정의·룰은 신규 |
| `0060_activity.sql` | 영업 활동 · 태스크 (`ellis_*_id`로 ELLIS 참조) | 부분 |
| `0070_brief.sql` | Weekly Brief · 코멘트 | ❌ 신규 |
| `0080_rls.sql` | Row-Level Security 정책 (참고용) | — |
| `0090_functions_triggers.sql` | updated_at 자동 갱신 등 | — |
| `0100_seed.sql` | 국가·기본 KPI 정의 시드 | — |

## 폐기된 파일 (이전 커밋 참고)

- `0040_crm.sql` — accounts, contacts, account_revenue_snapshots → **ELLIS 소유**
- `0050_pipeline.sql` — pipelines, deals, deal_stage_history → **ELLIS 소유**

## 향후 ELLIS 통합 흐름

1. ELLIS 팀에 위 SQL 보여주고 어떤 도메인을 ELLIS로 흡수 가능한지 합의
2. 합의된 도메인은 ELLIS REST 엔드포인트로 노출
3. `src/lib/ellis/` 어댑터에서 호출
4. UI는 mock → 실 호출로 점진 교체
