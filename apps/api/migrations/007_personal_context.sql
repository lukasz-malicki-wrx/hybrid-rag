-- The user's personal context: instructions on how answers should be written (language,
-- length, format, tone). Kept as an append-only history: every answer records the version it
-- was generated with, so its style can be explained later.
CREATE TABLE personal_contexts (
    id         bigserial PRIMARY KEY,
    text       text NOT NULL CHECK (length(text) <= 2000),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER personal_contexts_no_change BEFORE UPDATE OR DELETE ON personal_contexts
    FOR EACH ROW EXECUTE FUNCTION forbid_change();
CREATE TRIGGER personal_contexts_no_truncate BEFORE TRUNCATE ON personal_contexts
    FOR EACH STATEMENT EXECUTE FUNCTION forbid_change();
