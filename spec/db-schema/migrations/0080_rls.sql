-- ============================================================
-- RLS Helper Functions
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
-- Enable RLS (우리 소유 테이블만)
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
ALTER TABLE activities                ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_report_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_comments            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Tenant isolation policies
-- ============================================================
CREATE POLICY org_isolation_select ON users        FOR SELECT USING (org_id = current_org_id());
CREATE POLICY org_isolation_select ON teams        FOR SELECT USING (org_id = current_org_id());
CREATE POLICY org_isolation_select ON departments  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY org_isolation_select ON objectives      FOR SELECT USING (org_id = current_org_id());
CREATE POLICY org_isolation_select ON kpi_definitions FOR SELECT USING (org_id = current_org_id());
CREATE POLICY org_isolation_select ON activities      FOR SELECT USING (org_id = current_org_id());

CREATE POLICY tasks_view ON tasks
  FOR SELECT USING (org_id = current_org_id() AND
                    (current_role() IN ('SUPER_ADMIN','SALES_LEAD') OR owner_user_id = auth.uid()));

CREATE POLICY tasks_modify ON tasks FOR ALL
  USING (org_id = current_org_id() AND owner_user_id = auth.uid())
  WITH CHECK (org_id = current_org_id() AND owner_user_id = auth.uid());

-- ============================================================
-- OKR 정책 — 자기 OKR + 팀 OKR + 회사 OKR 보기
-- ============================================================
CREATE POLICY objectives_view ON objectives FOR SELECT USING (
  org_id = current_org_id() AND (
    owner_user_id = auth.uid()
    OR owner_team_id = current_team_id()
    OR owner_org_id = current_org_id()
    OR current_role() IN ('SUPER_ADMIN','SALES_LEAD')
  )
);

CREATE POLICY objectives_modify ON objectives FOR ALL
  USING (org_id = current_org_id() AND (
    owner_user_id = auth.uid()
    OR (current_role() = 'SALES_LEAD' AND owner_team_id = current_team_id())
    OR current_role() = 'SUPER_ADMIN'
  ))
  WITH CHECK (org_id = current_org_id());

CREATE POLICY critical_six_owner ON critical_six FOR ALL
  USING (user_id = auth.uid()
         OR (current_role() = 'SALES_LEAD'
             AND user_id IN (SELECT id FROM users WHERE team_id = current_team_id()))
         OR current_role() = 'SUPER_ADMIN')
  WITH CHECK (user_id = auth.uid() OR current_role() IN ('SUPER_ADMIN','SALES_LEAD'));

-- ============================================================
-- Brief 정책
-- ============================================================
CREATE POLICY brief_view ON weekly_reports FOR SELECT USING (
  org_id = current_org_id() AND (
    scope = 'COMPANY'
    OR (scope = 'TEAM' AND scope_team_id IN (
      SELECT id FROM teams WHERE current_role() IN ('SUPER_ADMIN','SALES_LEAD')
                              AND id = current_team_id()))
    OR (scope = 'USER' AND (scope_user_id = auth.uid()
                            OR current_role() IN ('SUPER_ADMIN','SALES_LEAD')))
  )
);

CREATE POLICY brief_write ON weekly_reports FOR ALL
  USING (org_id = current_org_id() AND
         (author_user_id = auth.uid() OR current_role() IN ('SUPER_ADMIN','SALES_LEAD')))
  WITH CHECK (org_id = current_org_id());
