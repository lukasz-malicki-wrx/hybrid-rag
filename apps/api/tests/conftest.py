import os

# Settings are read when the app is created; tests never connect to these.
os.environ.setdefault("DATABASE_URL", "postgresql://unused")
os.environ.setdefault("OLLAMA_URL", "http://unused")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000, https://app.example.com")
