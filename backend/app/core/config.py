from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "pactForge API"
    cors_origins: list[str] = ["http://localhost:3000"]
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-5"


settings = Settings()
