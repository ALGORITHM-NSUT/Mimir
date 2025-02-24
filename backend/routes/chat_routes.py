from fastapi import APIRouter
from controllers.chat_controller import handle_chat_request
from controllers.chat_controller import get_all_chats
from controllers.chat_controller import get_chat
from controllers.chat_controller import generate_chatShare_link
from controllers.chat_controller import get_shared_chat



router = APIRouter()

@router.post("/")
async def chat_endpoint(data: dict):
    return await handle_chat_request(data)


@router.get("/all")
async def get_chats_endpoint(userId: str):
    return await get_all_chats(userId)


@router.post("/share", tags=["Generate Share Link"])
def get_shareLink_endpoint(data: dict):
    return  generate_chatShare_link(data)


@router.get("/shared", tags= ["Validate the Shared Link"])
async def validate_link_endpoint(token: str):
    return  await get_shared_chat(token)


# always put this route in the last, because this is a dynamic route
@router.get("/{chatId}")
async def get_chat_endpoint(chatId: str, userId: str):
    return await get_chat(chatId, userId)
