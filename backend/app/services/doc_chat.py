import logging
from typing import Literal

from fastapi import HTTPException
from google import genai
from google.genai import types
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)

TOOL_NAME = "record_document_fields"

SYSTEM_PROMPT = """You are an assistant helping a user fill out a {template_name} \
through natural conversation, instead of a long form.

Ask about ONE thing at a time — focus on the "next field" given to you below. Keep \
replies short, warm, and conversational (one or two sentences). Acknowledge what the \
user just told you before asking the next question.

Whenever the user's latest message contains information you can confidently map to \
one or more document fields, call the {tool_name} tool with those fields filled in. \
You may fill in more than one field at once if the user volunteers multiple facts \
together (e.g. a company name, signatory name, and title in one sentence). Do not \
guess values the user didn't provide. For fields that only allow specific values, \
only record one of the allowed values.

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


class FieldDescriptor(BaseModel):
    path: str
    label: str
    options: list[str] | None = None


class NextField(BaseModel):
    path: str
    label: str


class ChatRequest(BaseModel):
    templateName: str
    fieldDescriptors: list[FieldDescriptor]
    messages: list[ChatMessage]
    fields: dict = {}
    nextField: NextField | None = None


class ChatResponse(BaseModel):
    reply: str
    extractedFields: dict = {}


def build_extraction_schema(descriptors: list[FieldDescriptor]) -> dict:
    """Builds the tool's JSON schema from a template's field descriptors, turning dotted
    paths (e.g. partyA.companyName) into nested object properties."""
    root: dict = {"type": "object", "properties": {}}
    for descriptor in descriptors:
        parts = descriptor.path.split(".")
        node = root
        for part in parts[:-1]:
            node = node["properties"].setdefault(part, {"type": "object", "properties": {}})
        leaf: dict = {"type": "string", "description": descriptor.label}
        if descriptor.options:
            leaf["enum"] = descriptor.options
        node["properties"][parts[-1]] = leaf
    return root


def filter_extracted_fields(args: dict, descriptors: list[FieldDescriptor]) -> dict:
    """Keeps only string values at paths declared by the template's descriptors,
    dropping anything malformed or hallucinated by the model."""
    allowed_paths = {d.path for d in descriptors}

    def walk(node: dict, prefix: str) -> dict:
        result: dict = {}
        for key, value in node.items():
            path = f"{prefix}.{key}" if prefix else key
            if isinstance(value, str):
                if path in allowed_paths:
                    result[key] = value
            elif isinstance(value, dict):
                nested = walk(value, path)
                if nested:
                    result[key] = nested
        return result

    filtered = walk(args, "")
    if filtered != args:
        logger.warning("Dropped unexpected tool call content: %r", args)
    return filtered


def _build_system_prompt(request: ChatRequest) -> str:
    next_field = f"{request.nextField.label} ({request.nextField.path})" if request.nextField else "null"
    return SYSTEM_PROMPT.format(
        template_name=request.templateName,
        tool_name=TOOL_NAME,
        known_fields=request.fields,
        next_field=next_field,
    )


def _to_gemini_role(role: Literal["user", "assistant"]) -> str:
    return "model" if role == "assistant" else "user"


def call_document_assistant(request: ChatRequest) -> ChatResponse:
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
                description="Record document field values extracted from the conversation.",
                parameters_json_schema=build_extraction_schema(request.fieldDescriptors),
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
            extracted_fields = filter_extracted_fields(function_call.args or {}, request.fieldDescriptors)

    # Gemini returns only a function-call part (no text) on a turn where it calls the
    # tool, unlike APIs that can return both in one turn. Send the tool result back so
    # the model produces the conversational reply the user actually sees.
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
