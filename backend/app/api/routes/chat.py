from fastapi import APIRouter

from app.services.doc_chat import ChatRequest, ChatResponse, call_document_assistant

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    return call_document_assistant(request)
