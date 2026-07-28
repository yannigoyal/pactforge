import logging
from typing import Literal

from fastapi import HTTPException
from google import genai
from google.genai import types
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

Calling the tool is never a substitute for replying — recording fields and asking the \
next question happen together in the same turn. After every user message, if "next \
field" below is not null, your reply must ask about it (after acknowledging what the \
user just said), even if you also called the tool that turn. Never end a turn having \
only called the tool with no question asked.

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


def _to_gemini_role(role: Literal["user", "assistant"]) -> str:
    return "model" if role == "assistant" else "user"


def call_nda_assistant(request: ChatRequest) -> ChatResponse:
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=503,
            detail="AI chat is not configured. Set GEMINI_API_KEY in backend/.env.",
        )

    messages = request.messages or [
        ChatMessage(role="user", content=CONVERSATION_START_SENTINEL)
    ]

    tool = types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name=TOOL_NAME,
                description="Record NDA field values extracted from the conversation.",
                parameters_json_schema=NdaFieldsUpdate.model_json_schema(),
            )
        ]
    )

    config = types.GenerateContentConfig(
        system_instruction=_build_system_prompt(request),
        tools=[tool],
    )
    contents = [
        types.Content(role=_to_gemini_role(m.role), parts=[types.Part.from_text(text=m.content)])
        for m in messages
    ]

    client = genai.Client(api_key=settings.gemini_api_key)
    response = client.models.generate_content(model=settings.gemini_model, contents=contents, config=config)

    extracted_fields: dict = {}
    for function_call in response.function_calls or []:
        if function_call.name == TOOL_NAME:
            try:
                extracted_fields = NdaFieldsUpdate(**function_call.args).model_dump(exclude_none=True)
            except ValidationError:
                logger.warning("Ignoring malformed tool call input: %r", function_call.args)

    # Gemini returns only a function-call part (no text) on a turn where it calls the
    # tool, unlike Anthropic's API which can return both in one turn. Send the tool
    # result back so the model produces the conversational reply the user actually sees.
    if response.function_calls:
        follow_up_contents = contents + [
            response.candidates[0].content,
            types.Content(
                role="user",
                parts=[
                    types.Part.from_function_response(name=fc.name, response={"status": "recorded"})
                    for fc in response.function_calls
                ],
            ),
        ]
        response = client.models.generate_content(
            model=settings.gemini_model, contents=follow_up_contents, config=config
        )

    return ChatResponse(reply=(response.text or "").strip(), extractedFields=extracted_fields)
