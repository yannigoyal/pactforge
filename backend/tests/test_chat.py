from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.services.doc_chat import FieldDescriptor, build_extraction_schema, filter_extracted_fields

client = TestClient(app)

DESCRIPTORS = [
    {"path": "purpose", "label": "Purpose"},
    {"path": "partyA.companyName", "label": "Party 1 company name"},
]


def test_chat_without_api_key_returns_503(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "")
    response = client.post(
        "/chat",
        json={"templateName": "Test Agreement", "fieldDescriptors": DESCRIPTORS, "messages": []},
    )
    assert response.status_code == 503


def test_build_extraction_schema_nests_dotted_paths():
    schema = build_extraction_schema(
        [
            FieldDescriptor(path="purpose", label="Purpose"),
            FieldDescriptor(path="partyA.companyName", label="Party 1 company name"),
            FieldDescriptor(path="rights", label="Rights", options=["Licensed", "Assigned"]),
        ]
    )
    assert schema["properties"]["purpose"] == {"type": "string", "description": "Purpose"}
    assert schema["properties"]["partyA"]["properties"]["companyName"]["type"] == "string"
    assert schema["properties"]["rights"]["enum"] == ["Licensed", "Assigned"]


def test_filter_extracted_fields_drops_unknown_and_malformed():
    descriptors = [
        FieldDescriptor(path="purpose", label="Purpose"),
        FieldDescriptor(path="partyA.companyName", label="Party 1 company name"),
    ]
    args = {
        "purpose": "Evaluate a partnership",
        "partyA": {"companyName": "Acme", "hallucinated": "x"},
        "unknownField": "y",
        "badType": 42,
    }
    assert filter_extracted_fields(args, descriptors) == {
        "purpose": "Evaluate a partnership",
        "partyA": {"companyName": "Acme"},
    }
