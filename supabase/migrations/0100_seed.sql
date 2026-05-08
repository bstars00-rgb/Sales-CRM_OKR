-- ============================================================
-- Countries (시드 — 호텔 B2B 핵심 국가만 우선)
-- ============================================================
INSERT INTO countries(code, name_en, name_ko, region) VALUES
  ('KR','Korea, Republic of','대한민국','APAC'),
  ('JP','Japan','일본','APAC'),
  ('CN','China','중국','APAC'),
  ('VN','Vietnam','베트남','APAC'),
  ('TH','Thailand','태국','APAC'),
  ('ID','Indonesia','인도네시아','APAC'),
  ('PH','Philippines','필리핀','APAC'),
  ('MY','Malaysia','말레이시아','APAC'),
  ('SG','Singapore','싱가포르','APAC'),
  ('TW','Taiwan','대만','APAC'),
  ('HK','Hong Kong','홍콩','APAC'),
  ('IN','India','인도','APAC'),
  ('AU','Australia','호주','APAC'),
  ('US','United States','미국','AMER'),
  ('GB','United Kingdom','영국','EMEA'),
  ('DE','Germany','독일','EMEA'),
  ('FR','France','프랑스','EMEA'),
  ('AE','United Arab Emirates','아랍에미리트','EMEA')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 데모 조직 (운영 시작 전 기본 1개)
-- ============================================================
INSERT INTO organizations(id, name, slug, base_currency, base_locale, timezone, fiscal_start_month, plan)
VALUES ('00000000-0000-0000-0000-000000000001',
        'Demo Hotel B2B Co.', 'demo', 'KRW', 'ko-KR', 'Asia/Seoul', 1, 'PRO')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 기본 KPI 정의 6종 (MVP)
-- ============================================================
INSERT INTO kpi_definitions(org_id, code, name, unit, aggregation, direction, weight_default, source_kind) VALUES
  ('00000000-0000-0000-0000-000000000001','REVENUE','거래액','KRW','SUM','UP_GOOD',35,'EXTERNAL_API'),
  ('00000000-0000-0000-0000-000000000001','GP','GP','KRW','SUM','UP_GOOD',25,'EXTERNAL_API'),
  ('00000000-0000-0000-0000-000000000001','NEW_ACCOUNTS','신규 활성 고객사','count','COUNT','UP_GOOD',10,'EXTERNAL_API'),
  ('00000000-0000-0000-0000-000000000001','MEETINGS','미팅 수','count','COUNT','UP_GOOD',10,'ACTIVITY'),
  ('00000000-0000-0000-0000-000000000001','PROPOSALS','제안서 발송 수','count','COUNT','UP_GOOD',10,'ACTIVITY'),
  ('00000000-0000-0000-0000-000000000001','CONTRACTS','계약 건수','count','COUNT','UP_GOOD',10,'EXTERNAL_API')
ON CONFLICT (org_id, code) DO NOTHING;
