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
    links: list[link]


class answer(BaseModel):
    answerable: bool
    queries: list[str]
    knowledge: str
    answer: str
    links: list[link]

class expand(BaseModel):
    queries: list[str]
    keywords: list[str]
    specifity: float