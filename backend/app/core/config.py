from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "pactForge API"
    cors_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
