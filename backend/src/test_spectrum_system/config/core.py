from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings.
    """

    DATABASE_URL: str = "postgresql+asyncpg://user:password@db:5432/test_spectrum_system"
    LOG_LEVEL: str = "info"
    ENVIRONMENT: str = "production"


settings = Settings()
