import json
from pathlib import Path

from pydantic import BaseModel, Field, model_validator


class EvalCase(BaseModel):
    id: str
    kind: str = Field(description="paraphrase | identifier | polish | unanswerable")
    question: str
    document: str | None = Field(
        default=None, description="Substring of the filename that holds the answer"
    )
    any_of: list[str] = Field(
        default_factory=list, description="Phrases; a chunk containing one is gold"
    )

    @property
    def answerable(self) -> bool:
        return self.kind != "unanswerable"

    @model_validator(mode="after")
    def _gold_matches_kind(self) -> "EvalCase":
        if self.answerable and not (self.document and self.any_of):
            raise ValueError(f"{self.id}: answerable cases need document and any_of")
        if not self.answerable and (self.document or self.any_of):
            raise ValueError(f"{self.id}: unanswerable cases must not name a gold answer")
        return self


def load_cases(path: Path) -> list[EvalCase]:
    return [EvalCase.model_validate(item) for item in json.loads(path.read_text())]
