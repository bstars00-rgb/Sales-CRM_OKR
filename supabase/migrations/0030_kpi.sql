CREATE TABLE kpi_definitions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id),
  code              VARCHAR(40) NOT NULL,
  name              VARCHAR(80) NOT NULL,
  unit              VARCHAR(20) NOT NULL,
  aggregation       VARCHAR(20) NOT NULL CHECK (aggregation IN ('SUM','COUNT','AVG','RATIO')),
  direction         VARCHAR(10) NOT NULL DEFAULT 'UP_GOOD' CHECK (direction IN ('UP_GOOD','DOWN_GOOD')),
  weight_default    NUMERIC(5,2),
  source_kind       VARCHAR(20) NOT NULL CHECK (source_kind IN ('DEAL','ACCOUNT','ACTIVITY','TASK','REPORT','MANUAL','EXTERNAL_API')),
  formula           JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);

ALTER TABLE key_results
  ADD CONSTRAINT key_results_kpi_fk FOREIGN KEY (linked_kpi_def_id)
  REFERENCES kpi_definitions(id) ON DELETE SET NULL;

CREATE TABLE kpi_targets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_def_id      UUID NOT NULL REFERENCES kpi_definitions(id),
  owner_kind      okr_owner_kind NOT NULL,
  owner_org_id    UUID REFERENCES organizations(id),
  owner_team_id   UUID REFERENCES teams(id),
  owner_user_id   UUID REFERENCES users(id),
  period_kind     period_kind NOT NULL,
  period_year     SMALLINT NOT NULL,
  period_index    SMALLINT NOT NULL,
  target_value    NUMERIC(18,2) NOT NULL,
  weight          NUMERIC(5,2) NOT NULL DEFAULT 0,
  stretch_value   NUMERIC(18,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (num_nonnulls_uuid(owner_org_id, owner_team_id, owner_user_id) = 1),
  UNIQUE (kpi_def_id, owner_org_id, owner_team_id, owner_user_id, period_kind, period_year, period_index)
);

CREATE TABLE kpi_actuals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_def_id        UUID NOT NULL REFERENCES kpi_definitions(id),
  owner_kind        okr_owner_kind NOT NULL,
  owner_org_id      UUID REFERENCES organizations(id),
  owner_team_id     UUID REFERENCES teams(id),
  owner_user_id     UUID REFERENCES users(id),
  period_kind       period_kind NOT NULL,
  period_year       SMALLINT NOT NULL,
  period_index      SMALLINT NOT NULL,
  actual_value      NUMERIC(18,2) NOT NULL DEFAULT 0,
  achievement_pct   NUMERIC(7,2) NOT NULL DEFAULT 0,
  score             NUMERIC(7,2),
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_ref        JSONB,
  CHECK (num_nonnulls_uuid(owner_org_id, owner_team_id, owner_user_id) = 1),
  UNIQUE (kpi_def_id, owner_org_id, owner_team_id, owner_user_id, period_kind, period_year, period_index)
);

CREATE TABLE incentive_rules (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_def_id          UUID NOT NULL REFERENCES kpi_definitions(id),
  applies_to_role     user_role,
  threshold_pct       NUMERIC(5,2) NOT NULL DEFAULT 80,
  rate_per_unit       NUMERIC(18,4) NOT NULL,
  cap_amount          NUMERIC(18,2),
  effective_from      DATE NOT NULL,
  effective_to        DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE incentive_payouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  period_kind     period_kind NOT NULL,
  period_year     SMALLINT NOT NULL,
  period_index    SMALLINT NOT NULL,
  total_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency        CHAR(3) NOT NULL,
  breakdown       JSONB NOT NULL DEFAULT '{}'::jsonb,
  status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                  CHECK (status IN ('DRAFT','CONFIRMED','PAID')),
  confirmed_by    UUID REFERENCES users(id),
  confirmed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_kind, period_year, period_index)
);

CREATE INDEX idx_kpi_actuals_user ON kpi_actuals(kpi_def_id, owner_user_id, period_year, period_index)
  WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_kpi_actuals_team ON kpi_actuals(kpi_def_id, owner_team_id, period_year, period_index)
  WHERE owner_team_id IS NOT NULL;
CREATE INDEX idx_kpi_targets_owner ON kpi_targets(kpi_def_id, owner_user_id, owner_team_id, period_year, period_index);
