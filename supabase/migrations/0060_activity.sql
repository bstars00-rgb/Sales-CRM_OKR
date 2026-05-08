CREATE TYPE activity_type AS ENUM ('NOTE','CALL','MEETING','EMAIL_LOG','MESSENGER',
                                   'PROPOSAL_SENT','CONTRACT_SENT','FOLLOW_UP',
                                   'CUSTOMER_REQUEST','INTERNAL_REQUEST');

CREATE TABLE activities (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id),
  activity_type     activity_type NOT NULL,
  user_id           UUID NOT NULL REFERENCES users(id),
  account_id        UUID REFERENCES accounts(id) ON DELETE SET NULL,
  deal_id           UUID REFERENCES deals(id) ON DELETE SET NULL,
  contact_id        UUID REFERENCES contacts(id) ON DELETE SET NULL,
  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes  INT,
  subject           VARCHAR(200),
  content           TEXT,
  outcome           VARCHAR(40),
  participants      JSONB,
  external_ref      JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (account_id IS NOT NULL OR deal_id IS NOT NULL OR contact_id IS NOT NULL)
);

CREATE TABLE tasks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES organizations(id),
  owner_user_id       UUID NOT NULL REFERENCES users(id),
  related_account_id  UUID REFERENCES accounts(id) ON DELETE SET NULL,
  related_deal_id     UUID REFERENCES deals(id) ON DELETE SET NULL,
  related_contact_id  UUID REFERENCES contacts(id) ON DELETE SET NULL,
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
CREATE INDEX idx_activities_deal      ON activities(deal_id, occurred_at DESC) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_activities_account   ON activities(account_id, occurred_at DESC) WHERE account_id IS NOT NULL;
CREATE INDEX idx_tasks_owner_due      ON tasks(owner_user_id, status, due_at);
