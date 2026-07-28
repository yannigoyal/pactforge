from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_chat_without_api_key_returns_503():
    response = client.post("/chat/nda", json={"messages": [], "fields": {}})
    assert response.status_code == 503
