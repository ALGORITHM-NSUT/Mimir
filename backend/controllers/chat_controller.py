import secrets
from datetime import datetime
from fastapi import HTTPException
from pymongo import ASCENDING
from utils.db import db
from utils.token_utils import generate_secure_token
from utils.token_utils import verify_chat_share_token
from utils.response_strategy import response_strategy
import os
import langchain_core


messages_collection = db["messages"]
user_chats_collection = db["user_chats"]


async def handle_chat_request(data: dict):
    chatId = data.get("chatId")
    message = data.get("message")
    userId = data.get("userId")
    chatHistory = data.get("chatHistory")
    chats = []
    for chat in chatHistory:
        chats.append(langchain_core.messages.human.HumanMessage(chat["query"]))
        
        references = "\nLinks:\n" + " \n ".join(f"{ref['title']}: {ref['url']}" for ref in chat["references"]) if chat.get("references") else ""

        response = chat["response"] + references
        chats.append(langchain_core.messages.AIMessage(response))

    if not chatId:
        chatId = f"chat-{secrets.token_hex(8)}"

    try:
        full_response = await response_strategy(message, chats)
        response_text = full_response["response"]
        references = full_response["references"]

        message_data = {
            "chatId": chatId,
            "userId": userId,
            "query": message,
            "response": response_text,
            "references": references,
            "timestamp": datetime.utcnow()
        }

        inserted_message = await messages_collection.insert_one(message_data)
        message_id = str(inserted_message.inserted_id)

        await user_chats_collection.update_one(
            {"userId": userId, "chatId": chatId},
            {"$setOnInsert": {"title": message}},
            upsert=True
        )

        return {
            "chatId": chatId,
            "messageId": message_id,
            "response": response_text,
            "references": references,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_all_chats(userId: str):
    if not userId:
        raise HTTPException(status_code=400, detail="userId is required")

    chat_cursor = user_chats_collection.find({"userId": userId}, {"_id": 0, "chatId": 1, "title": 1})
    chat_list = await chat_cursor.to_list(None)

    return {"chats": chat_list}

async def get_chat(chatId: str, userId: str):
    chat_cursor = messages_collection.find(
        {"chatId": chatId, "userId": userId},
        {"_id": 0}
    ).sort("timestamp", ASCENDING)

    chat_history = await chat_cursor.to_list(None)

    if not chat_history:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized access")

    return {"chatId": chatId, "chatHistory": chat_history}

def generate_chatShare_link(data: dict):
    chatId = data["chatId"]
    userId = data["userId"]

    token = generate_secure_token(chatId, userId)
    frontend_url = os.getenv("FRONTEND_URL")
    shareable_link = f"{frontend_url}/chat/shared?token={token}"

    return {"message": "Chat is now shareable", "shareableLink": shareable_link}


async def get_shared_chat(token: str):
    chat_data = verify_chat_share_token(token)

    if not chat_data:
        raise HTTPException(status_code=403, detail="Invalid or expired share link.")

    userId, chatId = chat_data

    print(chatId)

    chat_cursor = messages_collection.find({"chatId": chatId}, {"_id": 0}).sort("timestamp", 1)
    chat_history = await chat_cursor.to_list(None)

    if not chat_history:
        raise HTTPException(status_code=404, detail="Chat not found.")

    return {"chatId": chatId, "chatHistory": chat_history}