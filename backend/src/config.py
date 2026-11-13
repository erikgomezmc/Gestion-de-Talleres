import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings:
    PORT = int(os.getenv("PORT", "5000"))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    JWT_SECRET = os.getenv("JWT_SECRET", "taller-norte-demo-secret")
    FRONTEND_ORIGINS = [origin.strip() for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:8000").split(",") if origin.strip()]
    DB_PATH = os.getenv("DB_PATH", str(BASE_DIR / "data" / "taller_norte.db"))


settings = Settings()
