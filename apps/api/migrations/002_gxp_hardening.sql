-- 1. Order the audit hash chain by lock acquisition, not by sequence allocation.
--    The column default draws an id before the trigger takes the lock, so two concurrent
--    inserts could chain in a different order than their ids and fail audit_verify().
--    Drawing the id again under the lock makes id order equal chain order (gaps are harmless).
CREATE OR REPLACE FUNCTION audit_log_chain() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    last_hash text;
BEGIN
    PERFORM pg_advisory_xact_lock(727275);
    NEW.id := nextval(pg_get_serial_sequence('audit_log', 'id'));
    SELECT hash INTO last_hash FROM audit_log ORDER BY id DESC LIMIT 1;
    NEW.ts := clock_timestamp();
    NEW.prev_hash := last_hash;
    NEW.hash := audit_row_hash(last_hash, NEW.event, NEW.payload, NEW.ts);
    RETURN NEW;
END $$;

-- to_char() is STABLE, so the function using it cannot honestly be IMMUTABLE.
ALTER FUNCTION audit_row_hash(text, text, jsonb, timestamptz) STABLE;

-- 2. Questions and answers are records: append-only, like the audit log.
CREATE FUNCTION forbid_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END $$;

CREATE TRIGGER queries_no_change BEFORE UPDATE OR DELETE ON queries
    FOR EACH ROW EXECUTE FUNCTION forbid_change();
CREATE TRIGGER queries_no_truncate BEFORE TRUNCATE ON queries
    FOR EACH STATEMENT EXECUTE FUNCTION forbid_change();
CREATE TRIGGER answers_no_change BEFORE UPDATE OR DELETE ON answers
    FOR EACH ROW EXECUTE FUNCTION forbid_change();
CREATE TRIGGER answers_no_truncate BEFORE TRUNCATE ON answers
    FOR EACH STATEMENT EXECUTE FUNCTION forbid_change();

CREATE INDEX answers_query_idx ON answers (query_id);
