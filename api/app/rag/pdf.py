import io

from pypdf import PdfReader


def extract_pages(data: bytes) -> list[str]:
    reader = PdfReader(io.BytesIO(data))
    return [(page.extract_text() or "").replace("\x00", "") for page in reader.pages]
