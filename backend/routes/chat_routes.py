from fastapi import APIRouter, BackgroundTasks
from controllers.chat_controller import handle_chat_request, user_chat_delete, get_all_chats, get_chat, generate_chatShare_link, generate_chatShare_link, get_shared_chat
from controllers.chat_controller import get_response, prepare_chat_data, change_title, upsert_chat


router = APIRouter()

@router.post("/")
async def chat_endpoint(data: dict, background_tasks: BackgroundTasks):
    
    new_data = prepare_chat_data(data)

    background_tasks.add_task(upsert_chat, new_data["userId"], new_data["chatId"], data.get("message"))
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

@router.post("/changeTitle/{chatId}", tags=["Updates Chat title"])
async def change_chat_title(chatId:str, data: dict):
    return await change_title(chatId, data)


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


@router.post("/del/{chatId}")
async def delete_chat_for_user(chatId: str, data: dict):
    return await user_chat_delete(chatId, data)


