DOC = {
    "templateId": "bonterms-mutual-nda",
    "title": "Mutual NDA — Acme Corp",
    "values": {"purpose": "Evaluate a partnership", "partyA": {"companyName": "Acme"}},
}


def test_documents_require_auth(client):
    assert client.get("/documents").status_code == 401
    assert client.post("/documents", json=DOC).status_code == 401


def test_document_crud_flow(client, auth_headers):
    headers = auth_headers()

    created = client.post("/documents", json=DOC, headers=headers)
    assert created.status_code == 201
    doc_id = created.json()["id"]
    assert created.json()["values"]["purpose"] == "Evaluate a partnership"

    listed = client.get("/documents", headers=headers)
    assert listed.status_code == 200
    assert [d["id"] for d in listed.json()] == [doc_id]
    assert "values" not in listed.json()[0]

    fetched = client.get(f"/documents/{doc_id}", headers=headers)
    assert fetched.status_code == 200
    assert fetched.json()["values"] == DOC["values"]

    updated = client.put(
        f"/documents/{doc_id}",
        json={**DOC, "title": "Renamed", "values": {"purpose": "Changed"}},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Renamed"
    assert updated.json()["values"] == {"purpose": "Changed"}

    assert client.delete(f"/documents/{doc_id}", headers=headers).status_code == 204
    assert client.get(f"/documents/{doc_id}", headers=headers).status_code == 404


def test_documents_are_scoped_per_user(client, auth_headers):
    alice = auth_headers("alice@example.com")
    bob = auth_headers("bob@example.com")

    doc_id = client.post("/documents", json=DOC, headers=alice).json()["id"]

    assert client.get("/documents", headers=bob).json() == []
    assert client.get(f"/documents/{doc_id}", headers=bob).status_code == 404
    assert client.put(f"/documents/{doc_id}", json=DOC, headers=bob).status_code == 404
    assert client.delete(f"/documents/{doc_id}", headers=bob).status_code == 404
    # Alice still has it
    assert client.get(f"/documents/{doc_id}", headers=alice).status_code == 200
