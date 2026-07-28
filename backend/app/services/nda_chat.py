import logging
from typing import Literal

from anthropic import Anthropic
from fastapi import HTTPException
from pydantic import BaseModel, ValidationError

from app.core.config import settings

logger = logging.getLogger(__name__)

TOOL_NAME = "record_nda_fields"

SYSTEM_PROMPT = """You are an assistant helping a user fill out a Bonterms Mutual NDA \
through natural conversation, instead of a long form.

Ask about ONE thing at a time — focus on the "next field" given to you below. Keep \
replies short, warm, and conversational (one or two sentences). Acknowledge what the \
user just told you before asking the next question.

Whenever the user's latest message contains information you can confidently map to \
one or more NDA fields, call the {tool_name} tool with those fields filled in. You may \
fill in more than one field at once if the user volunteers multiple facts together \
(e.g. a company name, signatory name, and title in one sentence). Do not guess values \
the user didn't provide.

If "next field" below is null, all required fields are filled: congratulate the user, \
remind them the live preview is up to date, and tell them to review it and click \
"Download PDF" when ready. Still use the tool if they want to change something.

Known fields so far (JSON): {known_fields}

Next field to ask about: {next_field}
"""

# Sent as the very first user turn when the transcript is empty, so the assistant opens
# the conversation itself. Not rendered in the visible chat log by the frontend.
CONVERSATION_START_SENTINEL = "__start__"


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class NextField(BaseModel):
    path: str
    label: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    fields: dict = {}
    nextField: NextField | None = None


class ChatResponse(BaseModel):
    reply: str
    extractedFields: dict = {}


class PartyFieldsUpdate(BaseModel):
    companyName: str | None = None
    signatoryName: str | None = None
    signatoryTitle: str | None = None
    noticeEmail: str | None = None
    noticePostalAddress: str | None = None
    signature: str | None = None
    date: str | None = None


class NdaFieldsUpdate(BaseModel):
    purpose: str | None = None
    effectiveDate: str | None = None
    termOfNda: str | None = None
    confidentialityPeriod: str | None = None
    governingLaw: str | None = None
    courts: str | None = None
    additionalTerms: str | None = None
    partyA: PartyFieldsUpdate | None = None
    partyB: PartyFieldsUpdate | None = None


def _build_system_prompt(request: ChatRequest) -> str:
    next_field = f"{request.nextField.label} ({request.nextField.path})" if request.nextField else "null"
    return SYSTEM_PROMPT.format(
        tool_name=TOOL_NAME, known_fields=request.fields, next_field=next_field
    )


def call_nda_assistant(request: ChatRequest) -> ChatResponse:
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=503,
            detail="AI chat is not configured. Set ANTHROPIC_API_KEY in backend/.env.",
        )

    messages = request.messages or [
        ChatMessage(role="user", content=CONVERSATION_START_SENTINEL)
    ]

    client = Anthropic(api_key=settings.anthropic_api_key)
    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=1024,
        system=_build_system_prompt(request),
        messages=[{"role": m.role, "content": m.content} for m in messages],
        tools=[
            {
                "name": TOOL_NAME,
                "description": "Record NDA field values extracted from the conversation.",
                "input_schema": NdaFieldsUpdate.model_json_schema(),
            }
        ],
    )

    reply_parts: list[str] = []
    extracted_fields: dict = {}
    for block in response.content:
        if block.type == "text":
            reply_parts.append(block.text)
        elif block.type == "tool_use" and block.name == TOOL_NAME:
            try:
                extracted_fields = NdaFieldsUpdate(**block.input).model_dump(exclude_none=True)
            except ValidationError:
                logger.warning("Ignoring malformed tool call input: %r", block.input)

    return ChatResponse(reply="\n".join(reply_parts).strip(), extractedFields=extracted_fields)
