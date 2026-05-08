CREATE TYPE deal_type    AS ENUM ('NEW','RENEWAL','UPSELL','API_INTEGRATION',
                                   'HOTEL_SUPPLY','TICKET_SUPPLY','CO_PROMOTION');
CREATE TYPE deal_outcome AS ENUM ('OPEN','WON','LOST');

CREATE TABLE pipelines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  name        VARCHAR(80) NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pipeline_stages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id           UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name                  VARCHAR(60) NOT NULL,
  order_no              SMALLINT NOT NULL,
  probability_default   NUMERIC(5,2) NOT NULL DEFAULT 50,
  stage_kind            VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                        CHECK (stage_kind IN ('OPEN','WON','LOST')),
  UNIQUE (pipeline_id, order_no)
);

CREATE TABLE deals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               UUID NOT NULL REFERENCES organizations(id),
  pipeline_id          UUID NOT NULL REFERENCES pipelines(id),
  current_stage_id     UUID NOT NULL REFERENCES pipeline_stages(id),
  account_id           UUID NOT NULL REFERENCES accounts(id),
  primary_contact_id   UUID REFERENCES contacts(id) ON DELETE SET NULL,
  owner_user_id        UUID NOT NULL REFERENCES users(id),
  name                 VARCHAR(160) NOT NULL,
  deal_type            deal_type NOT NULL DEFAULT 'NEW',
  outcome              deal_outcome NOT NULL DEFAULT 'OPEN',
  amount               NUMERIC(18,2) NOT NULL DEFAULT 0,
  expected_gp          NUMERIC(18,2),
  currency             CHAR(3) NOT NULL DEFAULT 'KRW' CHECK (currency ~ '^[A-Z]{3}$'),
  amount_in_base       NUMERIC(18,2) NOT NULL DEFAULT 0,
  fx_rate_snapshot     NUMERIC(18,8) NOT NULL DEFAULT 1,
  probability_pct      NUMERIC(5,2) NOT NULL DEFAULT 50 CHECK (probability_pct BETWEEN 0 AND 100),
  expected_close_date  DATE NOT NULL,
  actual_close_date    DATE,
  next_action          VARCHAR(200),
  next_action_due      DATE,
  lost_reason_code     VARCHAR(40),
  lost_reason_note     TEXT,
  win_reason_code      VARCHAR(40),
  competitors          TEXT[],
  blockers             JSONB NOT NULL DEFAULT '[]'::jsonb,
  internal_help_needed JSONB NOT NULL DEFAULT '[]'::jsonb,
  visibility           VARCHAR(10) NOT NULL DEFAULT 'TEAM'
                       CHECK (visibility IN ('PRIVATE','TEAM','ORG')),
  external_ids         JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_fields        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at           TIMESTAMPTZ
);

CREATE TABLE deal_stage_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id         UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage_id   UUID REFERENCES pipeline_stages(id),
  to_stage_id     UUID NOT NULL REFERENCES pipeline_stages(id),
  moved_by        UUID NOT NULL REFERENCES users(id),
  moved_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds BIGINT,
  note            TEXT,
  auto            BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_deals_owner_outcome   ON deals(org_id, owner_user_id, outcome) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_pipeline_stage  ON deals(pipeline_id, current_stage_id, expected_close_date)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_close_open      ON deals(org_id, expected_close_date)
  WHERE outcome='OPEN' AND deleted_at IS NULL;
CREATE INDEX idx_deal_history_deal     ON deal_stage_history(deal_id, moved_at DESC);
