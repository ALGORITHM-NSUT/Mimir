import os
import jwt as pyjwt
import requests
from datetime import datetime, timedelta
from fastapi import APIRouter, Response, HTTPException, Request, Depends
from utils.db import db
from bson import ObjectId
from dotenv import load_dotenv
from utils.redis_client import redis_client

load_dotenv()

users_collection = db["users"]

SECRET_KEY = os.getenv("JWT_SECRET", "your_secret_key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
TOKEN_EXPIRY = int(os.getenv("JWT_EXPIRATION_MINUTES", 99999))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CACHE_TTL = int(os.getenv("REDIS_TTL")) 


def create_jwt_token(user_id: str):
    expiration = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY)
    payload = {"userId": user_id, "exp": expiration}
    return pyjwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_google_token(token: str):
    GOOGLE_TOKEN_VERIFY_URL = "https://oauth2.googleapis.com/tokeninfo"
    response = requests.get(f"{GOOGLE_TOKEN_VERIFY_URL}?id_token={token}")
    if response.status_code != 200:
        return None
    return response.json()


from fastapi import Request, Response, HTTPException
from bson import ObjectId

async def login_user(request: Request, response: Response):
    data = await request.json()
    credential = data.get("credential")

    if not credential:
        raise HTTPException(status_code=400, detail="Google credential is required")

    google_user = verify_google_token(credential)

    if not google_user or google_user.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = google_user["email"]
    name = google_user.get("name", "User")
    google_id = google_user["sub"]
    picture = google_user.get("profileImage", "")  
    user = await users_collection.find_one({"email": email})

    if not user:
        user_id = str(ObjectId())
        new_user = {
            "_id": user_id,
            "google_id": google_id,
            "email": email,
            "name": name,
            "picture": picture,  # Store profile picture
            "created_at": datetime.utcnow()
        }
        await users_collection.insert_one(new_user)
        user = new_user

    token = create_jwt_token(str(user["_id"]))

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True, 
        samesite="None",
        max_age=360000
    )

    return {
        "message": "Login successful",
        "user": {
            "userId": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "picture": user.get("picture", "")  
        }
    }


async def logout_user(response: Response):
    response.delete_cookie("access_token", httponly=True, samesite="None", secure=True, path="/"  )
    return {"message": "Logged out successfully"}

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(payload['userId'])
        user = await users_collection.find_one({"_id": payload["userId"]})

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return {
            "userId": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "profileImage": user.get("profile_image", "")  # Include profile image
        }

    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    

async def get_current_user_cache(request: Request):
    token = request.cookies.get("access_token")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Check Redis cache first
    cached_user = redis_client.get(token)  
    if cached_user:
        return eval(cached_user)  # Convert back to dictionary

    try:
        # Decode token
        payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = await users_collection.find_one({"_id": payload["userId"]})

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        user_data = {
            "userId": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "profileImage": user.get("profile_image", "")
        }

        # Store in Redis with expiration
        redis_client.setex(token, CACHE_TTL, str(user_data))

        return user_data

    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")