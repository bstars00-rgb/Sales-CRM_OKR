-- ============================================================
-- RLS Helper Functions (use in policies)
-- ============================================================
CREATE OR REPLACE FUNCTION current_org_id() RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$ SELECT org_id FROM users WHERE id = auth.uid() AND deleted_at IS NULL $$;

CREATE OR REPLACE FUNCTION current_role() RETURNS user_role
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$ SELECT role FROM users WHERE id = auth.uid() AND deleted_at IS NULL $$;

CREATE OR REPLACE FUNCTION current_team_id() RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$ SELECT team_id FROM users WHERE id = auth.uid() AND deleted_at IS NULL $$;

-- ============================================================
-- Enable RLS
-- ============================================================
ALTER TABLE organizations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_country_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives                ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results               ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans              ENABLE ROW LEVEL SECURITY;
ALTER TABLE critical_six              ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_definitions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets               ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_actuals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE incentive_rules           ENABLE ROW LEVEL SECURITY;
ALTER TABLE incentive_payouts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_revenue_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_notes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_account_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history        ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities                ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_report_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_comments            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tenant isolation policies (org_id 기반 — 대부분 테이블)
-- ============================================================
CREATE POLICY org_isolation_select ON users        FOR SELECT USING (org_id = current_org_id());
CREATE POLICY org_isolation_select ON teams        FOR SELECT USING (org_id = current_org_id());
CREATE POLICY org_isolation_select ON departments  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY org_isolation_select ON objectives     FOR SELECT USING (org_id = current_org_id());
CREATE POLICY org_isolation_select ON kpi_definitions FOR SELECT USING (org_id = current_org_id());
CREATE POLICY org_isolation_select ON pipelines      FOR SELECT USING (org_id = current_org_id());
CREATE POLICY org_isolation_select ON activities     FOR SELECT USING (org_id = current_org_id());
CREATE POLICY org_isolation_select ON tasks
  FOR SELECT USING (org_id = current_org_id() AND
                    (current_role() IN ('SUPER_ADMIN','SALES_LEAD') OR owner_user_id = auth.uid()));

-- ============================================================
-- Account 권한 정책 (역할별 view)
-- ============================================================
CREATE POLICY accounts_view ON accounts
  FOR SELECT USING (
    org_id = current_org_id() AND deleted_at IS NULL AND (
      current_role() = 'SUPER_ADMIN'
      OR (current_role() = 'SALES_LEAD'
          AND owner_user_id IN (SELECT id FROM users WHERE team_id = current_team_id()))
      OR (current_role() = 'SALES_MANAGER'
          AND (owner_user_id = auth.uid() OR visibility IN ('TEAM','ORG')
               OR id IN (SELECT account_id FROM user_account_assignments WHERE user_id = auth.uid())))
      OR (current_role() = 'COLLABORATOR'
          AND id IN (SELECT account_id FROM user_account_assignments WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY accounts_insert ON accounts FOR INSERT
  WITH CHECK (org_id = current_org_id() AND
              current_role() IN ('SUPER_ADMIN','SALES_LEAD','SALES_MANAGER'));

CREATE POLICY accounts_update ON accounts FOR UPDATE
  USING (org_id = current_org_id() AND
         (current_role() IN ('SUPER_ADMIN','SALES_LEAD') OR owner_user_id = auth.uid()));

-- ============================================================
-- Deal 권한 정책 (account 권한을 따름)
-- ============================================================
CREATE POLICY deals_view ON deals
  FOR SELECT USING (
    org_id = current_org_id() AND deleted_at IS NULL AND
    account_id IN (SELECT id FROM accounts)  -- accounts RLS 위임
  );

CREATE POLICY deals_modify ON deals FOR ALL
  USING (org_id = current_org_id() AND
         (current_role() IN ('SUPER_ADMIN','SALES_LEAD') OR owner_user_id = auth.uid()))
  WITH CHECK (org_id = current_org_id());

-- ============================================================
-- Brief 정책
-- ============================================================
CREATE POLICY brief_view ON weekly_reports
  FOR SELECT USING (
    org_id = current_org_id() AND (
      scope = 'COMPANY'
      OR (scope = 'TEAM' AND (current_role() IN ('SUPER_ADMIN','SALES_LEAD','SALES_MANAGER')
                              AND scope_team_id IN (SELECT id FROM teams)))
      OR (scope = 'USER' AND (scope_user_id = auth.uid()
                              OR current_role() IN ('SUPER_ADMIN','SALES_LEAD')))
    )
  );

CREATE POLICY brief_write ON weekly_reports FOR ALL
  USING (org_id = current_org_id() AND
         (author_user_id = auth.uid() OR current_role() IN ('SUPER_ADMIN','SALES_LEAD')))
  WITH CHECK (org_id = current_org_id());

-- 추가 테이블의 정책은 운영 단계에서 추가 (MVP 시작 시 위 6개로 핵심 커버)
