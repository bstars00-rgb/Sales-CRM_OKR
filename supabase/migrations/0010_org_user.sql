CREATE TYPE user_role AS ENUM ('SUPER_ADMIN','SALES_LEAD','SALES_MANAGER','COLLABORATOR');

CREATE TABLE organizations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(120) NOT NULL,
  slug                 VARCHAR(60)  NOT NULL UNIQUE,
  base_currency        CHAR(3)      NOT NULL DEFAULT 'KRW',
  base_locale          VARCHAR(10)  NOT NULL DEFAULT 'ko-KR',
  timezone             VARCHAR(40)  NOT NULL DEFAULT 'Asia/Seoul',
  fiscal_start_month   SMALLINT     NOT NULL DEFAULT 1 CHECK (fiscal_start_month BETWEEN 1 AND 12),
  plan                 VARCHAR(20)  NOT NULL DEFAULT 'FREE',
  settings             JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at           TIMESTAMPTZ
);

CREATE TABLE countries (
  code     CHAR(2)     PRIMARY KEY,
  name_en  VARCHAR(80) NOT NULL,
  name_ko  VARCHAR(80) NOT NULL,
  region   VARCHAR(40) NOT NULL
);

CREATE TABLE departments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID NOT NULL REFERENCES organizations(id),
  name                  VARCHAR(80) NOT NULL,
  parent_department_id  UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ
);

CREATE TABLE teams (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id),
  department_id  UUID REFERENCES departments(id) ON DELETE SET NULL,
  name           VARCHAR(80) NOT NULL,
  lead_user_id   UUID,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ
);

CREATE TABLE users (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id),
  team_id         UUID REFERENCES teams(id) ON DELETE SET NULL,
  email           CITEXT NOT NULL,
  name            VARCHAR(80) NOT NULL,
  role            user_role NOT NULL DEFAULT 'SALES_MANAGER',
  job_title       VARCHAR(60),
  locale          VARCHAR(10),
  timezone        VARCHAR(40),
  status          VARCHAR(20) NOT NULL DEFAULT 'INVITED'
                  CHECK (status IN ('ACTIVE','INVITED','DISABLED')),
  last_login_at   TIMESTAMPTZ,
  auth_provider   VARCHAR(20) NOT NULL DEFAULT 'EMAIL',
  external_id     VARCHAR(120),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE (org_id, email)
);

ALTER TABLE teams
  ADD CONSTRAINT teams_lead_fk FOREIGN KEY (lead_user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE user_country_assignments (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country_code  CHAR(2) NOT NULL REFERENCES countries(code),
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, country_code)
);

CREATE INDEX idx_users_org      ON users(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_org_team ON users(org_id, team_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_teams_org      ON teams(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_departments_org ON departments(org_id) WHERE deleted_at IS NULL;
