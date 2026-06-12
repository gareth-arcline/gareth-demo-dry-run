from pydantic import BaseModel, Field
from typing import Optional


class FileMetadata(BaseModel):
    file_id: str
    file_name: str
    file_size: int
    file_type: str


class UploadResponse(BaseModel):
    files: list[FileMetadata]


class SubTopic(BaseModel):
    id: str
    text: str


class Topic(BaseModel):
    id: str
    title: str
    sub_topics: list[SubTopic] = []


class Outline(BaseModel):
    topics: list[Topic]


class GenerateOutlineRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    file_ids: list[str]


class GenerateOutlineResponse(BaseModel):
    outline: Outline


class UpdateOutlineRequest(BaseModel):
    outline: Outline


class UpdateOutlineResponse(BaseModel):
    outline: Outline


class GenerateContentRequest(BaseModel):
    outline: Outline
    file_ids: list[str]


class SubTopicContent(BaseModel):
    id: str
    title: str
    content: str


class TopicContent(BaseModel):
    id: str
    title: str
    content: str = ""
    sub_topics: list[SubTopicContent] = []


class GeneratedNotes(BaseModel):
    topics: list[TopicContent]


class GenerateContentResponse(BaseModel):
    notes: GeneratedNotes
