-- Groups (named collections of documents and conversations), multi-turn conversations and
-- favourites. Conversations and groups are deleted softly: questions and answers stay
-- append-only records, and the audit log notes who deleted what.

CREATE TABLE groups (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
    created_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);
CREATE UNIQUE INDEX groups_active_name_idx ON groups (lower(btrim(name))) WHERE deleted_at IS NULL;

-- A document can belong to several groups; it is stored and indexed only once.
CREATE TABLE group_documents (
    group_id    uuid NOT NULL REFERENCES groups (id),
    document_id uuid NOT NULL REFERENCES documents (id),
    added_at    timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (group_id, document_id)
);
CREATE INDEX group_documents_document_idx ON group_documents (document_id);

CREATE TABLE conversations (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    uuid REFERENCES groups (id),
    title       text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 200),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    favorite_at timestamptz,
    deleted_at  timestamptz,
    CHECK (deleted_at IS NULL OR favorite_at IS NULL)
);
CREATE INDEX conversations_recent_idx ON conversations (updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX conversations_group_idx ON conversations (group_id) WHERE deleted_at IS NULL;

-- At most 10 favourites, enforced in the database so concurrent requests cannot exceed it.
CREATE FUNCTION enforce_favorite_limit() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.favorite_at IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.favorite_at IS NULL) THEN
        PERFORM pg_advisory_xact_lock(727276);
        IF (SELECT count(*) FROM conversations
            WHERE favorite_at IS NOT NULL AND id <> NEW.id) >= 10 THEN
            RAISE EXCEPTION 'at most 10 favourite conversations are allowed'
                USING ERRCODE = 'check_violation', CONSTRAINT = 'conversations_favorite_limit';
        END IF;
    END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER conversations_favorite_limit BEFORE INSERT OR UPDATE OF favorite_at ON conversations
    FOR EACH ROW EXECUTE FUNCTION enforce_favorite_limit();

-- Questions belong to a conversation (NULL for questions asked before conversations existed).
ALTER TABLE queries ADD COLUMN conversation_id uuid REFERENCES conversations (id);
CREATE INDEX queries_conversation_idx ON queries (conversation_id, created_at);

-- Answer flags, stored with the answer so the conversation view can show them.
-- (Adding columns is not an UPDATE, so the append-only triggers do not fire.)
ALTER TABLE answers
    ADD COLUMN refused   boolean,
    ADD COLUMN uncited   boolean,
    ADD COLUMN citations integer[],
    ADD COLUMN stopped   boolean NOT NULL DEFAULT false;
