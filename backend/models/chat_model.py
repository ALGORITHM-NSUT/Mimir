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
