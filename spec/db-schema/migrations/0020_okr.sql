CREATE TYPE okr_owner_kind AS ENUM ('COMPANY','TEAM','USER');
CREATE TYPE period_kind    AS ENUM ('MONTH','QUARTER','HALF','YEAR');

CREATE TABLE objectives (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               UUID NOT NULL REFERENCES organizations(id),
  owner_kind           okr_owner_kind NOT NULL,
  owner_org_id         UUID REFERENCES organizations(id),
  owner_team_id        UUID REFERENCES teams(id),
  owner_user_id        UUID REFERENCES users(id),
  parent_objective_id  UUID REFERENCES objectives(id) ON DELETE SET NULL,
  title                VARCHAR(200) NOT NULL,
  description          TEXT,
  period_kind          period_kind NOT NULL,
  period_year          SMALLINT NOT NULL,
  period_index         SMALLINT NOT NULL,
  status               VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                       CHECK (status IN ('DRAFT','ACTIVE','CLOSED')),
  progress_pct         NUMERIC(5,2) DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at           TIMESTAMPTZ,
  CHECK (num_nonnulls_uuid(owner_org_id, owner_team_id, owner_user_id) = 1)
);

CREATE TABLE key_results (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id        UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  title               VARCHAR(200) NOT NULL,
  metric_kind         VARCHAR(20) NOT NULL CHECK (metric_kind IN ('NUMBER','CURRENCY','PERCENT','BOOLEAN')),
  target_value        NUMERIC(18,2) NOT NULL,
  current_value       NUMERIC(18,2) NOT NULL DEFAULT 0,
  unit                VARCHAR(20),
  linked_kpi_def_id   UUID,
  progress_source     VARCHAR(10) NOT NULL DEFAULT 'MANUAL'
                      CHECK (progress_source IN ('MANUAL','AUTO')),
  order_no            SMALLINT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE action_plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id     UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  title             VARCHAR(200) NOT NULL,
  assignee_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date          DATE,
  status            VARCHAR(20) NOT NULL DEFAULT 'TODO'
                    CHECK (status IN ('TODO','DOING','DONE','BLOCKED')),
  order_no          SMALLINT NOT NULL DEFAULT 0,
  note              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE critical_six (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  iso_year  SMALLINT NOT NULL,
  iso_week  SMALLINT NOT NULL CHECK (iso_week BETWEEN 1 AND 53),
  items     JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, iso_year, iso_week)
);

CREATE INDEX idx_objectives_org_period ON objectives(org_id, period_year, period_index, owner_kind);
CREATE INDEX idx_objectives_owner_user ON objectives(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_objectives_owner_team ON objectives(owner_team_id) WHERE owner_team_id IS NOT NULL;
CREATE INDEX idx_key_results_obj      ON key_results(objective_id, order_no);
CREATE INDEX idx_action_plans_kr      ON action_plans(key_result_id, order_no);
CREATE INDEX idx_critical_six_user_wk ON critical_six(user_id, iso_year, iso_week);
