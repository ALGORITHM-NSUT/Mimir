from typing import List, Optional
from pydantic import BaseModel, Field

class Message(BaseModel):
    query: str
    response: str
    references: Optional[List[dict]] = []
    messageId: Optional[str] = Field(None, alias="_id")  

class UserChat(BaseModel):
    userId: str
    chatId: str
    title: str

class link(BaseModel):
    title: str
    link: str

class response(BaseModel):
    retrieve: bool
    query: str
    answer: str
    knowledge: str
    links: list[link]

class query(BaseModel):
    query: str
    specifity: float
    expansivity: float
    keywords: list[str]

class step(BaseModel):
    step: int
    reason: str
    specific_queries: list[query]
    document_queries: list[str]

class expand(BaseModel):
    action_plan: list[step]

class answer(BaseModel):
    final_answer: bool
    queries: list[query]
    partial_answer: str
    answer: str
    step: int
    links: list[link]
