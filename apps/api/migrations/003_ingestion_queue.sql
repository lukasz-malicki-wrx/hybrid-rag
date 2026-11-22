-- Ingestion moves from an in-process background task to a durable job queue in Postgres,
-- processed by a separate worker. Status changes are published with NOTIFY.

ALTER TABLE documents
    ADD COLUMN progress       integer NOT NULL DEFAULT 0,
    ADD COLUMN progress_total integer;

CREATE TABLE ingestion_jobs (
    id           bigserial PRIMARY KEY,
    document_id  uuid NOT NULL REFERENCES documents (id),
    status       text NOT NULL DEFAULT 'queued'
                 CHECK (status IN ('queued', 'running', 'done', 'failed')),
    attempts     integer NOT NULL DEFAULT 0,
    max_attempts integer NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
    run_after    timestamptz NOT NULL DEFAULT now(),
    locked_by    text,
    heartbeat_at timestamptz,
    last_error   text,
    created_at   timestamptz NOT NULL DEFAULT now(),
    finished_at  timestamptz
);
-- The worker's claim query scans only waiting jobs.
CREATE INDEX ingestion_jobs_waiting_idx ON ingestion_jobs (run_after, id) WHERE status = 'queued';
-- At most one active job per document.
CREATE UNIQUE INDEX ingestion_jobs_one_active_idx ON ingestion_jobs (document_id)
    WHERE status IN ('queued', 'running');

-- Wake the worker as soon as a job is queued (NOTIFY is delivered on commit).
CREATE FUNCTION notify_ingestion_job() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status = 'queued' THEN
        PERFORM pg_notify('ingestion_jobs', NEW.id::text);
    END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER ingestion_jobs_notify AFTER INSERT OR UPDATE OF status ON ingestion_jobs
    FOR EACH ROW EXECUTE FUNCTION notify_ingestion_job();

-- Publish every status or progress change of a document for live status streams.
CREATE FUNCTION notify_document_status() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_notify('document_status', json_build_object(
        'id', NEW.id,
        'status', NEW.status,
        'progress', NEW.progress,
        'progress_total', NEW.progress_total,
        'error', NEW.error
    )::text);
    RETURN NEW;
END $$;
CREATE TRIGGER documents_notify_status
    AFTER INSERT OR UPDATE OF status, progress, progress_total, error ON documents
    FOR EACH ROW EXECUTE FUNCTION notify_document_status();

-- Documents left in 'processing' by the old in-process ingestion have no job and no stored
-- original: fail them (audited) so they can be uploaded again.
WITH stuck AS (
    UPDATE documents
    SET status = 'failed',
        error = 'interrupted before the ingestion queue existed; upload the file again'
    WHERE status = 'processing'
    RETURNING id
)
INSERT INTO audit_log (event, payload)
SELECT 'document.failed', jsonb_build_object('id', id, 'error', 'interrupted (migration 003)')
FROM stuck;
