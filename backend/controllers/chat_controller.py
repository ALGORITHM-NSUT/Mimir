from datetime import datetime
from fastapi import HTTPException
from pymongo import ASCENDING
from utils.db import db
from utils.token_utils import generate_secure_token
from utils.token_utils import verify_chat_share_token
from utils.response_strategy import response_strategy
import os
import langchain_core
import secrets
from fastapi.encoders import jsonable_encoder

messages_collection = db["messages"]
user_chats_collection = db["user_chats"]


async def prepare_chat_data(data: dict) -> dict:
    chatId = data.get("chatId")
    message = data.get("message")
    userId = data.get("userId")

    if not chatId:
        chatId = f"chat-{secrets.token_hex(8)}"
        data["chatId"] = chatId 

    messageId = f"msg-{secrets.token_hex(8)}"
    data["messageId"] = messageId

    await user_chats_collection.update_one(
        {"userId": userId, "chatId": chatId},
        {
            "$set": {"chatId": chatId, "userId": userId},  # Ensure chatId is stored
            "$setOnInsert": {"title": message, "createdAt": datetime.utcnow()}
        },
        upsert=True
    )

    return data


async def handle_chat_request(data: dict):
    chatId = data.get("chatId")
    message = data.get("message")
    userId = data.get("userId")
    chatHistory = data.get("chatHistory")
    messageId = data.get("messageId")
    chats = []

    if not userId:
        raise HTTPException(status_code=400, detail="User ID is required")

    print(data)

    if chatHistory:
        for chat in chatHistory:
            try:
                # Ensure "query" exists and is a string
                query = chat.get("query")
                if not isinstance(query, str):
                    raise ValueError(f"Invalid query format in chat: {chat}")

                chats.append(langchain_core.messages.human.HumanMessage(query))

                # Handle missing or malformed references
                references = ""
                if "references" in chat and isinstance(chat["references"], list):
                    references_list = [
                        f"{ref.get('title', 'Untitled')}: {ref.get('link', '#')}"
                        for ref in chat["references"]
                        if isinstance(ref, dict) and "link" in ref and "title" in ref
                    ]
                    if references_list:
                        references = "\nLinks:\n" + " \n ".join(references_list)

                # Ensure "response" exists and is a string
                response = chat.get("response")
                if not isinstance(response, str):
                    raise ValueError(f"Invalid response format in chat: {chat}")

                chats.append(langchain_core.messages.AIMessage(response + references))

            except Exception as e:
                print(f"Error processing chat entry: {e}")

    try:
        full_response = await response_strategy(message, chats)
        response_text = full_response["response"]
        references = full_response["references"]

        message_data = {
            "chatId": chatId,
            "userId": userId,
            "messageId": messageId,
            "query": message,
            "response": response_text,
            "references": references,
            "timestamp": datetime.utcnow()
        }

        inserted_message = await messages_collection.insert_one(message_data)
        message_id = str(inserted_message.inserted_id)

        

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


async def get_response(userId: str, data: dict):
    messageId = data.get("messageId")
    message_data = await messages_collection.find_one(
        {"messageId": messageId, "userId": userId},
        {"_id": 0}
    )
    

    if not message_data:
        return {"response" : "Processing"}
    return jsonable_encoder(message_data)