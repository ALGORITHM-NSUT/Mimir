from fastapi import APIRouter, BackgroundTasks
from controllers.chat_controller import handle_chat_request
from controllers.chat_controller import get_all_chats
from controllers.chat_controller import get_chat
from controllers.chat_controller import generate_chatShare_link
from controllers.chat_controller import get_shared_chat
from controllers.chat_controller import get_response

import secrets
from controllers.chat_controller import prepare_chat_data

router = APIRouter()

@router.post("/")
async def chat_endpoint(data: dict, background_tasks: BackgroundTasks):
    
    new_data = await prepare_chat_data(data)

    background_tasks.add_task(handle_chat_request, data)

    return {
        "chatId": new_data["chatId"],
        "messageId": new_data["messageId"],
        "status": "processing."
    }



@router.get("/all")
async def get_chats_endpoint(userId: str):
    return await get_all_chats(userId)


@router.post("/share", tags=["Generate Share Link"])
def get_shareLink_endpoint(data: dict):
    return  generate_chatShare_link(data)


@router.get("/shared", tags= ["Validate the Shared Link"])
async def validate_link_endpoint(token: str):
    return  await get_shared_chat(token)


@router.post("/response/{userId}")
async def get_chat_response(userId: str, data: dict):
    return await get_response(userId, data)

# always put this route in the last, because this is a dynamic route
@router.post("/{chatId}")
async def get_chat_endpoint(chatId: str, data: dict):
    return await get_chat(chatId, data)


