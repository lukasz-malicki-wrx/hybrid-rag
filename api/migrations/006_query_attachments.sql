-- Files attached to a question (shown above it in the conversation). Recorded when the
-- question is stored; questions stay append-only. Questions stored before this migration
-- have no recorded attachments.
ALTER TABLE queries ADD COLUMN attached_document_ids uuid[] NOT NULL DEFAULT '{}';
