import json
from functools import lru_cache
from pathlib import Path

from pydantic import Field, HttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_URL = f"sqlite:///{(BASE_DIR / 'dev.db').as_posix()}"


class Settings(BaseSettings):
    app_name: str = "Data Web Foundation API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"

    database_url: str = DEFAULT_DATABASE_URL
    database_connect_timeout_seconds: int = 5
    auto_create_tables: bool = True

    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )

    external_api_url: HttpUrl | None = None
    external_api_timeout_seconds: int = 8

    supabase_url: HttpUrl | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None

    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str | None) -> str:
        if not value:
            return DEFAULT_DATABASE_URL

        db_url = str(value).strip()
        if db_url.startswith("postgres://"):
            return "postgresql+psycopg://" + db_url.removeprefix("postgres://")
        if db_url.startswith("postgresql://"):
            return "postgresql+psycopg://" + db_url.removeprefix("postgresql://")
        return db_url

    @field_validator("cors_origins", mode="before")
    @classmethod
    def normalize_cors_origins(cls, value: list[str] | str | None) -> list[str]:
        if value is None:
            return [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ]

        if isinstance(value, list):
            return [item.strip() for item in value if str(item).strip()]

        raw_value = str(value).strip()
        if not raw_value:
            return []

        if raw_value.startswith("["):
            try:
                parsed = json.loads(raw_value)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]
            except json.JSONDecodeError:
                pass

        return [item.strip() for item in raw_value.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
