from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuração lida de variáveis de ambiente (ou de um .env local)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str  # sem valor padrão: credencial nunca fica no código


@lru_cache
def get_settings() -> Settings:
    return Settings()
