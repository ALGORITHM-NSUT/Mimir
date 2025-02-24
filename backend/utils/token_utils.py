from fastapi import HTTPException
import os
import hmac
import hashlib
import base64


SECRET_KEY = os.getenv("SECRET_KEY")

def generate_secure_token(chatId: str, userId: str) -> str:
    if not chatId or not userId:
        raise HTTPException(status_code=400, detail="chatId and userId are required")

    data = f"{userId}:{chatId}".encode()
    signature = hmac.new(SECRET_KEY.encode(), data, hashlib.sha256).digest()
    token = base64.urlsafe_b64encode(data + signature).decode()

    return token

def verify_chat_share_token(token: str):
    try:
        decoded = base64.urlsafe_b64decode(token.encode())
        data, received_signature = decoded[:-32], decoded[-32:]

        expected_signature = hmac.new(SECRET_KEY.encode(), data, hashlib.sha256).digest()

        if not hmac.compare_digest(received_signature, expected_signature):
            return None 

        chatId, userId = data.decode().split(":")
        return chatId, userId  
    except Exception:
        return None  #