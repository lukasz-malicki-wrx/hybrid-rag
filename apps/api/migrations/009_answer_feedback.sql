-- The reader's rating of an answer. Answers are append-only, so the rating lives in its own
-- table, where it can be changed. Rows are never deleted: a withdrawn rating is NULL.
CREATE TABLE answer_feedback (
    answer_id  uuid PRIMARY KEY REFERENCES answers (id),
    rating     text CHECK (rating IN ('up', 'down')),
    updated_at timestamptz NOT NULL DEFAULT now()
);
