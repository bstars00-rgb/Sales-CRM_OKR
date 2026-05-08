-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'organizations','departments','teams','users','objectives','key_results','action_plans',
    'critical_six','kpi_definitions','kpi_targets','incentive_rules','incentive_payouts',
    'accounts','contacts','account_notes','deals','activities','tasks','weekly_reports'
  ])
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;

-- ============================================================
-- Deal 단계 이동 시 자동 history 기록
-- ============================================================
CREATE OR REPLACE FUNCTION log_deal_stage_change() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO deal_stage_history(deal_id, from_stage_id, to_stage_id, moved_by, moved_at, auto)
    VALUES (NEW.id, NULL, NEW.current_stage_id, NEW.owner_user_id, now(), FALSE);
  ELSIF NEW.current_stage_id IS DISTINCT FROM OLD.current_stage_id THEN
    INSERT INTO deal_stage_history(deal_id, from_stage_id, to_stage_id, moved_by, moved_at,
                                    duration_seconds, auto)
    VALUES (NEW.id, OLD.current_stage_id, NEW.current_stage_id,
            COALESCE(auth.uid(), NEW.owner_user_id), now(),
            EXTRACT(EPOCH FROM (now() - OLD.updated_at))::BIGINT, FALSE);
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_deals_stage_history
  AFTER INSERT OR UPDATE OF current_stage_id ON deals
  FOR EACH ROW EXECUTE FUNCTION log_deal_stage_change();

-- ============================================================
-- Account last_activity_at 자동 갱신 (activity 입력 시)
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_account_last_activity() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.account_id IS NOT NULL THEN
    UPDATE accounts SET last_activity_at = NEW.occurred_at, updated_at = now()
    WHERE id = NEW.account_id AND (last_activity_at IS NULL OR last_activity_at < NEW.occurred_at);
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_activities_refresh_account
  AFTER INSERT ON activities
  FOR EACH ROW EXECUTE FUNCTION refresh_account_last_activity();
