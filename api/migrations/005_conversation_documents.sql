-- Documents pinned to a conversation. When a conversation has pinned documents it searches only
-- those; otherwise it searches its group's documents, or all documents when it has no group.
CREATE TABLE conversation_documents (
    conversation_id uuid NOT NULL REFERENCES conversations (id),
    document_id     uuid NOT NULL REFERENCES documents (id),
    added_at        timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (conversation_id, document_id)
);
CREATE INDEX conversation_documents_document_idx ON conversation_documents (document_id);
