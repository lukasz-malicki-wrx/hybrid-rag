# hybrid-rag

Ask questions about your PDFs and get answers with citations. Retrieval combines vector
search (pgvector, bge-m3 embeddings) with full-text search, fused with Reciprocal Rank Fusion.
Every answer is traceable: the exact chunks, document versions, models and prompt version are
stored, and an append-only, hash-chained audit log records what happened.

Everything runs locally with Docker Compose. No accounts, API keys or hosting are required.

> **Status:** the API is working (upload, versioning, hybrid search, streamed cited answers,
> audit trail, retrieval evaluation). The web UI is not built yet.

## Runs on CPU, on purpose

The stack runs in Docker on **CPU only**. This is a deliberate choice: anyone can clone the
repo and start it with one command, without a GPU, drivers or special Docker runtime.

The trade-off is speed. Embedding and text generation are noticeably slower than on a GPU:

- Indexing a PDF takes seconds to minutes depending on its size (a 29-page document took
  about 8 minutes on a laptop CPU).
- Answers start streaming after a short delay and arrive at CPU speed.
- The first request after startup is slower because the models are loaded into memory.

If you have a GPU, you can run Ollama natively with GPU support and point the API at it
(`OLLAMA_URL=http://host.docker.internal:11434`), or use the Claude API for generation
(`LLM_PROVIDER=anthropic`). Nothing else changes.

## Quick start

Requirements: Docker with Compose, about 4 GB of free disk space for the models and 8 GB of RAM.

```bash
docker compose up -d --build
```

The first start downloads two models through the `ollama-init` container (bge-m3 for
embeddings, about 1.2 GB, and qwen2.5:3b for answers, about 1.9 GB); the API starts once they
are in place. Follow progress with `docker compose logs -f ollama-init`. `GET /health` returns
200 when the database and models are ready and 503 otherwise.

All published ports are bound to `127.0.0.1`, so the database and Ollama are not reachable from
other machines.

Load the sample documents (four public regulatory PDFs kept in `samples/`, see
[samples/SOURCES.md](samples/SOURCES.md)):

```bash
./scripts/seed_samples.sh
```

On CPU the seed script waits up to 10 minutes for indexing to finish; set `WAIT_SECONDS` to change that.
If it times out, the documents keep processing in the background.

Then open the interactive API docs at <http://localhost:8000/docs>, or use curl:

```bash
# upload a PDF: 202 with status "processing"; a worker indexes it in the background
curl -F file=@my.pdf http://localhost:8000/documents

# follow its status and progress live (server-sent events), or poll GET /documents/{id}
curl -N http://localhost:8000/documents/<id>/events

# ask a question; the answer streams as server-sent events with [n] citations
curl -N -X POST http://localhost:8000/answers \
  -H 'content-type: application/json' \
  -d '{"question": "Who is allowed to certify batch release?"}'
```

## How it works

1. **Upload.** The original PDF is kept unchanged on the `uploads` volume under its SHA-256
   (identical files are deduplicated) and an ingestion job is queued in the same transaction as
   the document row. The same file name with different content becomes a new version; older
   versions are kept.
2. **Ingestion (worker).** A separate `worker` service takes jobs from a queue table in Postgres
   (`FOR UPDATE SKIP LOCKED`, woken by `LISTEN/NOTIFY`). It splits the text into chunks of about
   1800 characters that remember their page, embeds them with bge-m3 and stores them. Failed
   attempts are retried with backoff (30 s, 2 min, then the document is marked failed), and a job
   whose worker died is taken over once its heartbeat is stale. Status and progress are published
   to `GET /documents/{id}/events`.
3. **Retrieval.** The question is embedded. Vector search and full-text search each return 50
   candidates and RRF merges the rankings. Search can be limited to chosen documents.
4. **Relevance gate.** Nearest neighbours always exist, so "some results" proves nothing. The
   question counts as related to the corpus when the nearest chunk is within a cosine distance
   threshold (0.5 for bge-m3, calibrated on held-out questions) or, in hybrid mode, when one
   chunk contains every content word of the question (this keeps exact terms such as "ALCOA").
   Otherwise the API refuses without calling the model.
5. **Answering.** The top chunks go into the prompt as numbered, delimited excerpts, trimmed to
   fit the model's context window. The model must cite them as `[n]` and is told that excerpt
   text is data, not instructions. Refusals and answers without citations are flagged.
6. **Traceability.** Questions and answers are append-only. Each answer stores the chunk ids,
   document hashes and versions, embedding and LLM models and the prompt version, and its audit
   entry carries a SHA-256 of the answer text. `GET /audit/verify` checks the audit hash chain.

More detail: [docs/HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md) (in Polish).

## Retrieval quality

On 34 answerable questions over four public GxP documents, hybrid search reaches hit@10 of 100%
versus 91% for vector search alone, and it is the only mode that handles both exact terms and
Polish questions over English documents. It returned nothing for all 10 off-topic questions. Method, numbers and limitations are in
[docs/EVALUATION.md](docs/EVALUATION.md). Reproduce with:

```bash
docker compose exec api python -m app.evaluation --misses
```

## Configuration

Copy `.env.example` to `.env` to change defaults.

| Variable | Default | Meaning |
| --- | --- | --- |
| `LLM_PROVIDER` | `ollama` | `ollama` (local) or `anthropic` |
| `LLM_MODEL` | `qwen2.5:3b` | Model for the chosen provider |
| `ANTHROPIC_API_KEY` | empty | Required only for `anthropic` |
| `EMBED_MODEL` | `bge-m3` | Embedding model. The schema stores 1024-dimension vectors, so another model needs the same dimension (or a migration), a full re-index and a new `MAX_VECTOR_DISTANCE` |
| `MAX_VECTOR_DISTANCE` | `0.5` | Relevance gate threshold (cosine distance); `off` disables it |
| `LLM_NUM_CTX` | `8192` | Context window used for the model and for trimming the prompt |
| `OLLAMA_URL` | `http://ollama:11434` | Use `http://host.docker.internal:11434` for a native Ollama |
| `LLM_MAX_TOKENS` | `768` | Cap on answer length |
| `MAX_UPLOAD_MB` | `50` | Upload size limit |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated browser origins allowed to call the API |
| `DB_PORT` | `5433` | Host port of Postgres |
| `INGEST_MAX_ATTEMPTS` | `3` | Attempts per document before it is marked failed |
| `INGEST_STALE_SECONDS` | `600` | A running job without a heartbeat this long is taken over |

## Project layout

```
api/app/
  api/routes/     HTTP controllers
  schemas/        Pydantic request/response and event models
  services/       business logic and transactions
  repositories/   all SQL
  rag/            chunking, rank fusion, PDF, embedder, LLM providers
  core/           config, database, domain errors, migrations
  storage/        original file storage (content-addressed, verified on read)
  worker/         ingestion worker (`python -m app.worker`)
api/migrations/   SQL migrations applied at startup
eval/             evaluation questions
samples/          public PDFs used as sample data and evaluation corpus
scripts/          sample seeding and re-download
docs/             requirements, plan, explanation, evaluation
```

Requirements, including WCAG 2.1, responsive design and GxP, are in
[docs/REQUIREMENTS.md](docs/REQUIREMENTS.md); the roadmap is in [docs/PLAN.md](docs/PLAN.md).

## Limitations

- Scanned PDFs without a text layer are not supported (no OCR).
- Small local models can produce clumsy answers, especially in Polish, and sometimes reply with
  a citation only. The refusal sentence is in English.
- Uploaded documents go into the prompt. Delimiters and instructions reduce prompt injection
  from a malicious PDF but cannot rule it out; anyone can upload to the shared library.
- The relevance threshold is calibrated for bge-m3 on this corpus; other corpora may need a
  different value.
- The stopword list used for keyword search is English only.
- No authentication yet; the document library is shared.
- The audit log, questions and answers are tamper-evident, not tamper-proof: a database owner
  can disable the triggers and rewrite the hash chain, including deleting the newest entries.
  A production setup should run the API with a restricted database role and anchor the latest
  audit hash outside the database.
- No database connection pool: every request, worker step, status stream and stored answer opens
  its own Postgres connection. That is fine for a single user, but under concurrent load the
  connection setup adds latency and can hit Postgres' `max_connections`. The fix is a shared
  `psycopg_pool.ConnectionPool` created at startup (in the FastAPI lifespan) and used by
  `get_conn` and the background services instead of `psycopg.connect`.
- One worker processes one document at a time; on CPU more would only compete for the same
  cores. More workers can be started (`docker compose up --scale worker=2`) with a GPU.
- Each open status stream holds a database connection while it waits for changes.

## Development

Run with live code and auto-reload by adding the dev overlay:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

Dependencies are locked in `api/uv.lock` (managed with [uv](https://docs.astral.sh/uv/)). Lint
and tests with exactly the locked versions, without installing anything locally:

```bash
docker run --rm -v "$PWD:/repo" -w /repo/api -e UV_PROJECT_ENVIRONMENT=/tmp/venv \
  ghcr.io/astral-sh/uv:0.9.30-python3.12-bookworm-slim \
  sh -c "uv run --frozen ruff check . && uv run --frozen pytest -q"
```

Integration tests run against a real Postgres. They need a database whose name ends in `_test`
(the suite recreates its schema):

```bash
docker compose exec db createdb -U rag rag_test
docker run --rm --network hybrid-rag_default -v "$PWD:/repo" -w /repo/api \
  -e UV_PROJECT_ENVIRONMENT=/tmp/venv -e TEST_DATABASE_URL=postgresql://rag:rag@db:5432/rag_test \
  ghcr.io/astral-sh/uv:0.9.30-python3.12-bookworm-slim uv run --frozen pytest -q
```

Schema changes go in a new file under `api/migrations/`. Applied migrations are checksummed and
the API refuses to start if one of them was edited.

The API image is multi-stage, runs as a non-root user and has a liveness healthcheck
(`/health/live`). Base images and tools are pinned to exact versions.

CI runs lint, tests, Docker and compose checks, CodeQL, dependency review and secret scanning.

## License

See [LICENSE](LICENSE).
