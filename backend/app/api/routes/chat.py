from fastapi import APIRouter

from app.services.nda_chat import ChatRequest, ChatResponse, call_nda_assistant

router = APIRouter()


@router.post("/chat/nda", response_model=ChatResponse)
def chat_nda(request: ChatRequest) -> ChatResponse:
    return call_nda_assistant(request)
