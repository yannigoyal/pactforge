from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.document import Document
from app.models.user import User

router = APIRouter(prefix="/documents")


class DocumentIn(BaseModel):
    templateId: str
    title: str
    values: dict


class DocumentSummary(BaseModel):
    id: int
    templateId: str
    title: str
    updatedAt: datetime


class DocumentOut(DocumentSummary):
    values: dict


def _summary(doc: Document) -> DocumentSummary:
    return DocumentSummary(
        id=doc.id, templateId=doc.template_id, title=doc.title, updatedAt=doc.updated_at
    )


def _out(doc: Document) -> DocumentOut:
    return DocumentOut(
        id=doc.id,
        templateId=doc.template_id,
        title=doc.title,
        updatedAt=doc.updated_at,
        values=doc.values,
    )


def _get_owned_document(doc_id: int, user: User, db: Session) -> Document:
    doc = db.get(Document, doc_id)
    if doc is None or doc.user_id != user.id:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc


@router.get("", response_model=list[DocumentSummary])
def list_documents(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[DocumentSummary]:
    docs = db.scalars(
        select(Document).where(Document.user_id == user.id).order_by(Document.updated_at.desc())
    )
    return [_summary(doc) for doc in docs]


@router.post("", response_model=DocumentOut, status_code=201)
def create_document(
    payload: DocumentIn,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DocumentOut:
    doc = Document(
        user_id=user.id, template_id=payload.templateId, title=payload.title, values=payload.values
    )
    db.add(doc)
    db.commit()
    return _out(doc)


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(
    doc_id: int,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DocumentOut:
    return _out(_get_owned_document(doc_id, user, db))


@router.put("/{doc_id}", response_model=DocumentOut)
def update_document(
    doc_id: int,
    payload: DocumentIn,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DocumentOut:
    doc = _get_owned_document(doc_id, user, db)
    doc.template_id = payload.templateId
    doc.title = payload.title
    doc.values = payload.values
    db.commit()
    return _out(doc)


@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: int,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    doc = _get_owned_document(doc_id, user, db)
    db.delete(doc)
    db.commit()
