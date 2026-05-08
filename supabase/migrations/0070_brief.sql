CREATE TYPE report_scope  AS ENUM ('USER','TEAM','COMPANY');
CREATE TYPE report_status AS ENUM ('DRAFT','SUBMITTED','REVIEWED','REJECTED');

CREATE TABLE weekly_reports (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                   UUID NOT NULL REFERENCES organizations(id),
  scope                    report_scope NOT NULL,
  scope_user_id            UUID REFERENCES users(id),
  scope_team_id            UUID REFERENCES teams(id),
  iso_year                 SMALLINT NOT NULL,
  iso_week                 SMALLINT NOT NULL CHECK (iso_week BETWEEN 1 AND 53),
  author_user_id           UUID NOT NULL REFERENCES users(id),
  status                   report_status NOT NULL DEFAULT 'DRAFT',
  submitted_at             TIMESTAMPTZ,
  reviewed_at              TIMESTAMPTZ,
  reviewer_user_id         UUID REFERENCES users(id),
  draft_payload            JSONB NOT NULL DEFAULT '{}'::jsonb,
  highlights               TEXT,
  issues                   TEXT,
  next_week_plan           TEXT,
  next_week_critical_six   JSONB,
  critical_six_snapshot    JSONB,
  leader_feedback          TEXT,
  final_pdf_url            TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scope, scope_user_id, scope_team_id, iso_year, iso_week)
);

CREATE TABLE weekly_report_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   UUID NOT NULL REFERENCES weekly_reports(id) ON DELETE CASCADE,
  item_kind   VARCHAR(20) NOT NULL CHECK (item_kind IN ('ACCOUNT_UPDATE','DEAL_UPDATE','ISSUE','ACTION')),
  account_id  UUID REFERENCES accounts(id) ON DELETE SET NULL,
  deal_id     UUID REFERENCES deals(id) ON DELETE SET NULL,
  title       VARCHAR(200) NOT NULL,
  body        TEXT,
  order_no    SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE brief_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID NOT NULL REFERENCES weekly_reports(id) ON DELETE CASCADE,
  section         VARCHAR(40) NOT NULL,
  author_user_id  UUID NOT NULL REFERENCES users(id),
  body            TEXT NOT NULL,
  visibility      VARCHAR(20) NOT NULL DEFAULT 'AUTHOR_ONLY'
                  CHECK (visibility IN ('AUTHOR_ONLY','TEAM','ORG')),
  recognition     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_user_week    ON weekly_reports(scope, scope_user_id, iso_year, iso_week);
CREATE INDEX idx_reports_team_week    ON weekly_reports(scope, scope_team_id, iso_year, iso_week);
CREATE INDEX idx_report_items_report  ON weekly_report_items(report_id, order_no);
CREATE INDEX idx_brief_comments_report ON brief_comments(report_id);
