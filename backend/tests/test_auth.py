def test_register_login_me_flow(client):
    register = client.post(
        "/auth/register", json={"email": "Alice@Example.com", "password": "password123"}
    )
    assert register.status_code == 201
    assert register.json()["email"] == "alice@example.com"

    login = client.post(
        "/auth/login", json={"email": "alice@example.com", "password": "password123"}
    )
    assert login.status_code == 200
    token = login.json()["token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json() == {"email": "alice@example.com"}


def test_register_duplicate_email_conflicts(client):
    payload = {"email": "dup@example.com", "password": "password123"}
    assert client.post("/auth/register", json=payload).status_code == 201
    assert client.post("/auth/register", json=payload).status_code == 409


def test_register_short_password_rejected(client):
    response = client.post("/auth/register", json={"email": "a@b.com", "password": "short"})
    assert response.status_code == 422


def test_login_wrong_password_unauthorized(client):
    client.post("/auth/register", json={"email": "bob@example.com", "password": "password123"})
    response = client.post(
        "/auth/login", json={"email": "bob@example.com", "password": "wrong-password"}
    )
    assert response.status_code == 401


def test_me_without_token_unauthorized(client):
    assert client.get("/auth/me").status_code == 401


def test_me_with_garbage_token_unauthorized(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert response.status_code == 401
