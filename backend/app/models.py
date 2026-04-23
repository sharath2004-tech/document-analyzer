from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


# ---------- Auth ----------
class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=6, max_length=128)
    role: UserRole = UserRole.student


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole


# ---------- Documents ----------
class DocumentStatus(str, Enum):
    processing = "processing"
    ready = "ready"
    error = "error"


class DocumentOut(BaseModel):
    id: str
    title: str
    file_name: str
    uploaded_at: str
    status: DocumentStatus
    pages: int
    summary: Optional[str] = None
    concept_count: Optional[int] = None
    bloom_level: Optional[str] = None


class DocumentListResponse(BaseModel):
    documents: list[DocumentOut]


# ---------- Analysis ----------
class BloomLevel(str, Enum):
    remember = "remember"
    understand = "understand"
    apply = "apply"
    analyze = "analyze"
    evaluate = "evaluate"
    create = "create"


class SummaryType(str, Enum):
    brief = "brief"
    detailed = "detailed"
    exam_notes = "exam_notes"


class SummaryRequest(BaseModel):
    summary_type: SummaryType = SummaryType.detailed


class SummaryResponse(BaseModel):
    brief: str
    detailed: str
    exam_notes: str


class QARequest(BaseModel):
    question: str = Field(min_length=1)


class QAResponse(BaseModel):
    question: str
    answer: str
    sources: list[str]


class ConceptOut(BaseModel):
    id: str
    name: str
    description: str
    related_concepts: list[str]
    bloom_level: BloomLevel


class BloomItemOut(BaseModel):
    level: BloomLevel
    concepts: list[str]
    questions: list[str]
    percentage: float = 0.0


class InsightType(str, Enum):
    strength = "strength"
    weakness = "weakness"
    recommendation = "recommendation"


class InsightOut(BaseModel):
    id: str
    type: InsightType
    title: str
    description: str
    bloom_level: Optional[str] = None


class FullAnalysisResponse(BaseModel):
    summary: SummaryResponse
    concepts: list[ConceptOut]
    bloom_taxonomy: list[BloomItemOut]
    insights: list[InsightOut]


class QuizQuestion(BaseModel):
    id: str
    question: str
    question_type: str  # mcq, fill_blank, true_false
    options: Optional[list[str]] = None
    correct_answer: str
    bloom_level: BloomLevel
    explanation: str


class QuizResponse(BaseModel):
    questions: list[QuizQuestion]
