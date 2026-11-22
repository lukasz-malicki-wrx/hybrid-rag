CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    filename       text NOT NULL,
    sha256         text NOT NULL UNIQUE,
    version        integer NOT NULL,
    supersedes_id  uuid REFERENCES documents (id),
    status         text NOT NULL CHECK (status IN ('processing', 'ready', 'failed')),
    active         boolean NOT NULL DEFAULT true,
    pages          integer,
    error          text,
    uploaded_at    timestamptz NOT NULL DEFAULT now(),
    deactivated_at timestamptz,
    UNIQUE (filename, version)
);

CREATE TABLE chunks (
    id          bigserial PRIMARY KEY,
    document_id uuid NOT NULL REFERENCES documents (id),
    page        integer NOT NULL,
    position    integer NOT NULL,
    text        text NOT NULL,
    embedding   vector(1024) NOT NULL,
    tsv         tsvector GENERATED ALWAYS AS (to_tsvector('simple', text)) STORED,
    UNIQUE (document_id, position)
);
CREATE INDEX chunks_embedding_idx ON chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX chunks_tsv_idx ON chunks USING gin (tsv);
CREATE INDEX chunks_document_idx ON chunks (document_id);

CREATE TABLE queries (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at   timestamptz NOT NULL DEFAULT now(),
    question     text NOT NULL,
    document_ids uuid[] NOT NULL,
    params       jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE answers (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id       uuid NOT NULL REFERENCES queries (id),
    created_at     timestamptz NOT NULL DEFAULT now(),
    answer         text NOT NULL,
    chunk_ids      bigint[] NOT NULL,
    corpus         jsonb NOT NULL,
    embed_model    text NOT NULL,
    llm_provider   text NOT NULL,
    llm_model      text NOT NULL,
    prompt_version text NOT NULL
);

-- Append-only audit log with a hash chain for tamper evidence.
CREATE TABLE audit_log (
    id        bigserial PRIMARY KEY,
    ts        timestamptz NOT NULL,
    event     text NOT NULL,
    payload   jsonb NOT NULL DEFAULT '{}',
    prev_hash text,
    hash      text NOT NULL
);

CREATE FUNCTION audit_row_hash(prev text, ev text, pl jsonb, at timestamptz)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
    SELECT encode(
        sha256(convert_to(
            coalesce(prev, '') || '|' || ev || '|' || pl::text || '|' ||
            to_char(at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US'),
            'UTF8')),
        'hex')
$$;

CREATE FUNCTION audit_log_chain() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    last_hash text;
BEGIN
    PERFORM pg_advisory_xact_lock(727275);
    SELECT hash INTO last_hash FROM audit_log ORDER BY id DESC LIMIT 1;
    NEW.ts := clock_timestamp();
    NEW.prev_hash := last_hash;
    NEW.hash := audit_row_hash(last_hash, NEW.event, NEW.payload, NEW.ts);
    RETURN NEW;
END $$;

CREATE TRIGGER audit_log_chain BEFORE INSERT ON audit_log
    FOR EACH ROW EXECUTE FUNCTION audit_log_chain();

CREATE FUNCTION audit_log_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'audit_log is append-only';
END $$;

CREATE TRIGGER audit_log_no_change BEFORE UPDATE OR DELETE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();
CREATE TRIGGER audit_log_no_truncate BEFORE TRUNCATE ON audit_log
    FOR EACH STATEMENT EXECUTE FUNCTION audit_log_immutable();

-- Returns the id of the first row that breaks the chain, or NULL when intact.
CREATE FUNCTION audit_verify() RETURNS bigint LANGUAGE sql STABLE AS $$
    SELECT id FROM (
        SELECT id, prev_hash, hash,
               lag(hash) OVER (ORDER BY id) AS expected_prev,
               audit_row_hash(prev_hash, event, payload, ts) AS recomputed
        FROM audit_log
    ) t
    WHERE prev_hash IS DISTINCT FROM expected_prev OR hash <> recomputed
    ORDER BY id
    LIMIT 1
$$;
