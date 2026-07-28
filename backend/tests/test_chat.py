from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)


def test_chat_without_api_key_returns_503(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "")
    response = client.post("/chat/nda", json={"messages": [], "fields": {}})
    assert response.status_code == 503
