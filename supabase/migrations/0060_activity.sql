CREATE TYPE activity_type AS ENUM ('NOTE','CALL','MEETING','EMAIL_LOG','MESSENGER',
                                   'PROPOSAL_SENT','CONTRACT_SENT','FOLLOW_UP',
                                   'CUSTOMER_REQUEST','INTERNAL_REQUEST');

-- 영업 활동 기록 (우리 자체 DB).
-- 고객사·딜·담당자는 ELLIS의 ID를 참조 (외래키 X, 문자열 ID로 보관).
CREATE TABLE activities (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id),
  activity_type     activity_type NOT NULL,
  user_id           UUID NOT NULL REFERENCES users(id),
  ellis_account_id  TEXT,        -- ELLIS의 account id
  ellis_deal_id     TEXT,        -- ELLIS의 deal id
  ellis_contact_id  TEXT,        -- ELLIS의 contact id
  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes  INT,
  subject           VARCHAR(200),
  content           TEXT,
  outcome           VARCHAR(40),
  participants      JSONB,
  external_ref      JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    ellis_account_id IS NOT NULL
    OR ellis_deal_id IS NOT NULL
    OR ellis_contact_id IS NOT NULL
  )
);

CREATE TABLE tasks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES organizations(id),
  owner_user_id       UUID NOT NULL REFERENCES users(id),
  ellis_account_id    TEXT,
  ellis_deal_id       TEXT,
  ellis_contact_id    TEXT,
  title               VARCHAR(200) NOT NULL,
  description         TEXT,
  due_at              TIMESTAMPTZ,
  priority            VARCHAR(10) NOT NULL DEFAULT 'MED' CHECK (priority IN ('LOW','MED','HIGH')),
  status              VARCHAR(20) NOT NULL DEFAULT 'TODO'
                      CHECK (status IN ('TODO','DOING','DONE','CANCELLED')),
  completed_at        TIMESTAMPTZ,
  reminder_at         TIMESTAMPTZ,
  source              VARCHAR(20) DEFAULT 'MANUAL',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activities_user_when ON activities(org_id, user_id, occurred_at DESC);
CREATE INDEX idx_activities_ellis_deal     ON activities(ellis_deal_id, occurred_at DESC) WHERE ellis_deal_id IS NOT NULL;
CREATE INDEX idx_activities_ellis_account  ON activities(ellis_account_id, occurred_at DESC) WHERE ellis_account_id IS NOT NULL;
CREATE INDEX idx_tasks_owner_due           ON tasks(owner_user_id, status, due_at);
