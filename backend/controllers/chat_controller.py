from datetime import datetime
from fastapi import HTTPException
from bson import ObjectId
from pymongo import ASCENDING
from utils.db import db
from utils.token_utils import generate_secure_token
from utils.token_utils import verify_chat_share_token
from utils.response_strategy import response_strategy
from models.chat_model import response as response_format
import os
import secrets
from fastapi.encoders import jsonable_encoder
from google import genai
from google.genai import types
from google.genai.types import Content, UserContent
from constants.Semantic_cache_prompt import Semantic_cache_prompt
import json

from utils.redis_client import redis_client

CACHE_TTL = int(os.getenv("REDIS_TTL")) 

def get_next_index():
    # Get current index
    if redis_client.get("index") is None:
        redis_client.set("index", 0)
        return 0
    index = int(redis_client.get("index"))
    # Increment index (loop back to 0 after 19)
    next_index = (index + 1)
    redis_client.set("index", next_index)
    return index

index = get_next_index()
messages_collection = db["messages"]
user_chats_collection = db["user_chats"]
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY").split(" | ")[index % 2].strip()
client = genai.Client(api_key=GEMINI_API_KEY)

def prepare_chat_data(data: dict) -> dict:
    chatId = data.get("chatId")

    if not chatId:
        chatId = f"chat-{secrets.token_hex(8)}"
        data["chatId"] = chatId 

    messageId = f"msg-{secrets.token_hex(8)}"
    data["messageId"] = messageId

    return data  

async def upsert_chat(userId: str, chatId: str, message: str):
    await user_chats_collection.update_one(
        {"userId": userId, "chatId": chatId},
        {
            "$set": {"chatId": chatId, "userId": userId, "delete_for_user": False},
            "$setOnInsert": {"title": message, "createdAt": datetime.utcnow()},
        },
        upsert=True,
    )


async def handle_chat_request(data: dict):
    chatId = data.get("chatId")
    message = data.get("message")
    userId = data.get("userId")
    chatHistory = data.get("chatHistory")
    messageId = data.get("messageId")
    isDeepSearch = data.get("isDeepSearch", False)  # Get the deep search flag

    client = genai.Client(api_key=GEMINI_API_KEY)
    chats = client.chats.create(
        model="gemini-2.0-flash-thinking-exp-01-21",
        config=types.GenerateContentConfig(
        system_instruction=Semantic_cache_prompt,
        # response_mime_type='application/json',
        # response_schema=response_format,
        temperature=0.3)
    )

    if not userId:
        raise HTTPException(status_code=400, detail="User ID is required")

    if chatHistory:
        for chat in chatHistory:
            try:
                query = chat.get("query")
                if not isinstance(query, str):
                    raise ValueError(f"Invalid query format in chat: {chat}")

                references = ""
                if "references" in chat and isinstance(chat["references"], list):
                    references_list = [
                        f"{ref.get('title', 'Untitled')}: {ref.get('link', '#')}"
                        for ref in chat["references"]
                        if isinstance(ref, dict) and "link" in ref and "title" in ref
                    ]
                    if references_list:
                        references = "\nLinks:\n" + " \n ".join(references_list)

                response = chat.get("response")
                if not isinstance(response, str):
                    raise ValueError(f"Invalid response format in chat: {chat}")

                chats.record_history(
                    user_input=UserContent(parts=[{"text": query}]),
                    model_output=[Content(parts=[{"text": response + references}], role="model")],
                    is_valid=True,
                    automatic_function_calling_history=None,
                )

            except Exception as e:
                print(f"Error processing chat entry: {e}")

    try:
        full_response = await response_strategy(message, chats, isDeepSearch)
        response_text = full_response["response"]
        references = full_response["references"]
        code = full_response["code"]

        message_data = {
            "chatId": chatId,
            "userId": userId,
            "messageId": messageId,
            "query": message,
            "response": response_text,
            "references": references,
            "timestamp": datetime.utcnow().isoformat(),  # Convert datetime to string
        }

        inserted_message = await messages_collection.insert_one(message_data)

        # Convert all ObjectId fields to strings before storing in Redis
        def convert_objectid_to_str(data):
            if isinstance(data, dict):
                return {key: convert_objectid_to_str(value) for key, value in data.items()}
            elif isinstance(data, list):
                return [convert_objectid_to_str(item) for item in data]
            elif isinstance(data, ObjectId):
                return str(data)  # Convert ObjectId to string
            return data

        message_data = convert_objectid_to_str(message_data)

        try:
            redis_value = json.dumps(message_data)
            redis_key = f"message:{messageId}"
            print("Redis Connected:", redis_client.ping()) 
            redis_client.setex(redis_key, 60, redis_value)

            print(redis_key)
        except Exception as e:
            print(f"Error storing in Redis: {e}")

        return {
            "chatId": chatId,
            "messageId": messageId,
            "response": response_text,
            "references": references,
        }, code

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_all_chats(userId: str):
    if not userId:
        raise HTTPException(status_code=400, detail="userId is required")

    chat_cursor = user_chats_collection.find(
        {"userId": userId,  "delete_for_user": {"$ne": True}},
        {"_id": 0, "chatId": 1, "title": 1, }
    )
    chat_list = await chat_cursor.to_list(None)

    return {"chats": chat_list}

async def get_chat(chatId: str, data: dict):
    messageId = data.get("messageId")
    userId = data.get("userId")
    chat_cursor = messages_collection.find(
        {"chatId": chatId, "userId": userId}, 
        {"_id": 0}
    ).sort("timestamp", ASCENDING)


    chat_history = await chat_cursor.to_list(None)

    
    is_message_there = user_chats_collection.find({"messageId": messageId})

    if not chat_history:
        if not is_message_there:
            raise HTTPException(status_code=404, detail="Chat not found or unauthorized access")

    return {"chatId": chatId, "chatHistory": chat_history, "status": "resolved"}

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

    chat_cursor = messages_collection.find(
        {"chatId": chatId},
        {"_id": 0}
    ).sort("timestamp", 1)
    chat_history = await chat_cursor.to_list(None)

    if not chat_history:
        raise HTTPException(status_code=404, detail="Chat not found.")

    return {"chatId": chatId, "chatHistory": chat_history}


async def get_response(userId: str, data: dict):
    messageId = data.get("messageId")
    redis_key = f"message:{messageId}"

    print(redis_key )

    # Check Redis first
    cached_message = redis_client.get(redis_key)
    if cached_message:
        message_data = json.loads(cached_message)
        return jsonable_encoder(message_data)

    # If not found in Redis, return "Processing" (don't check MongoDB)
    return {"response": "Processing"}


async def user_chat_delete(chatId: str, data: dict):
    userId = data["userId"]

    result = await user_chats_collection.update_many(
        {"chatId": chatId, "userId": userId},
        {"$set": {"delete_for_user": True}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="No messages found to delete.")

    return {"message": "Chat marked as deleted for user."}


async def change_title(chatId: str, data: dict):
    userId = data.get("userId")
    new_title = data.get("newTitle")

    if not userId or not new_title:
        raise HTTPException(status_code=400, detail="Missing userId or title")

    result = await user_chats_collection.update_one(
        {"chatId": chatId, "userId": userId},
        {"$set": {"title": new_title}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")

    return {"message": "Title updated successfully"}
