CREATE TYPE account_segment AS ENUM ('HOTEL','OTA','TRAVEL_AGENCY','WHOLESALER','DMC','API_PARTNER','OFFLINE_AGENT');
CREATE TYPE account_grade   AS ENUM ('KEY_ACCOUNT','GROWTH','NEW_PROSPECT','DORMANT','LOW_POTENTIAL');
CREATE TYPE account_status  AS ENUM ('PROSPECT','CONTACTED','MEETING_DONE','PROPOSAL_SENT',
                                     'CONTRACTING','API_INTEGRATION','ACTIVE','DORMANT','LOST');

CREATE TABLE accounts (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                   UUID NOT NULL REFERENCES organizations(id),
  name                     VARCHAR(160) NOT NULL,
  legal_name               VARCHAR(200),
  segment                  account_segment NOT NULL,
  grade                    account_grade NOT NULL DEFAULT 'NEW_PROSPECT',
  status                   account_status NOT NULL DEFAULT 'PROSPECT',
  country_code             CHAR(2) NOT NULL REFERENCES countries(code),
  city                     VARCHAR(80),
  website                  VARCHAR(255),
  owner_user_id            UUID NOT NULL REFERENCES users(id),
  size_employees           INT,
  annual_volume_estimate   NUMERIC(18,2),
  growth_potential         VARCHAR(10) CHECK (growth_potential IN ('HIGH','MID','LOW')),
  risk_level               VARCHAR(10) CHECK (risk_level IN ('HIGH','MID','LOW')),
  risk_summary             TEXT,
  first_contact_date       DATE,
  last_activity_at         TIMESTAMPTZ,
  total_revenue_ytd        NUMERIC(18,2) DEFAULT 0,
  total_gp_ytd             NUMERIC(18,2) DEFAULT 0,
  visibility               VARCHAR(10) NOT NULL DEFAULT 'TEAM'
                           CHECK (visibility IN ('PRIVATE','TEAM','ORG')),
  external_ids             JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_fields            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at               TIMESTAMPTZ
);

CREATE TABLE contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  first_name      VARCHAR(80) NOT NULL,
  last_name       VARCHAR(80),
  title           VARCHAR(80),
  department      VARCHAR(80),
  email           CITEXT,
  phone           VARCHAR(40),
  messenger_kind  VARCHAR(20) CHECK (messenger_kind IN ('KAKAO','WHATSAPP','LINE','ZALO','WECHAT','TELEGRAM')),
  messenger_id    VARCHAR(120),
  decision_power  SMALLINT CHECK (decision_power BETWEEN 1 AND 5),
  influence       SMALLINT CHECK (influence BETWEEN 1 AND 5),
  relationship_temp VARCHAR(10) CHECK (relationship_temp IN ('COLD','COOL','WARM','HOT')),
  preferred_channel VARCHAR(20),
  preferred_contact_time VARCHAR(40),
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  do_not_contact  BOOLEAN NOT NULL DEFAULT FALSE,
  external_ids    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE account_revenue_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  year            SMALLINT NOT NULL,
  month           SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  revenue         NUMERIC(18,2) NOT NULL DEFAULT 0,
  gp              NUMERIC(18,2) NOT NULL DEFAULT 0,
  room_nights     INT,
  transactions    INT,
  currency        CHAR(3) NOT NULL,
  source_ref      JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, year, month)
);

CREATE TABLE account_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  author_user_id  UUID NOT NULL REFERENCES users(id),
  kind            VARCHAR(20) NOT NULL CHECK (kind IN ('RISK','OPPORTUNITY','GENERAL','STRATEGY')),
  content         TEXT NOT NULL,
  pinned          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_account_assignments (
  account_id       UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_account  VARCHAR(20) NOT NULL DEFAULT 'CO_OWNER'
                   CHECK (role_in_account IN ('OWNER','CO_OWNER','VIEWER')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, user_id)
);

CREATE INDEX idx_accounts_org_owner   ON accounts(org_id, owner_user_id, status)  WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_country     ON accounts(org_id, country_code)            WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_grade       ON accounts(org_id, grade, status)            WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_last_act    ON accounts(org_id, last_activity_at DESC)    WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_name_trgm   ON accounts USING GIN (name gin_trgm_ops);
CREATE INDEX idx_contacts_account     ON contacts(account_id, is_primary)           WHERE deleted_at IS NULL;
CREATE INDEX idx_revenue_snapshots    ON account_revenue_snapshots(account_id, year, month);
CREATE INDEX idx_notes_account        ON account_notes(account_id, pinned);
