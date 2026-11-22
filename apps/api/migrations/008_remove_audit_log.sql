-- The project no longer targets GxP: the hash-chained audit log and the versioned personal
-- context are removed. Rows are still never deleted: documents, groups and conversations are
-- deleted softly, links are marked removed, and questions and answers stay append-only.

DROP TABLE audit_log;
DROP FUNCTION audit_verify();
DROP FUNCTION audit_log_chain();
DROP FUNCTION audit_log_immutable();
DROP FUNCTION audit_row_hash(text, text, jsonb, timestamptz);

-- A single settings row (no user accounts yet), keeping the latest personal context.
CREATE TABLE user_settings (
    id               boolean PRIMARY KEY DEFAULT true CHECK (id),
    personal_context text NOT NULL DEFAULT '' CHECK (length(personal_context) <= 2000),
    updated_at       timestamptz NOT NULL DEFAULT now()
);
INSERT INTO user_settings (personal_context, updated_at)
SELECT text, created_at FROM personal_contexts ORDER BY id DESC LIMIT 1;
DROP TABLE personal_contexts;

-- Links between documents and groups or conversations are removed softly too.
ALTER TABLE group_documents ADD COLUMN removed_at timestamptz;
ALTER TABLE conversation_documents ADD COLUMN removed_at timestamptz;
