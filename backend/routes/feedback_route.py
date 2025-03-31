from fastapi import APIRouter, Response, Request
from controllers.feedback_controller import record_feedback, record_chat_feedback

router = APIRouter()

@router.post("/record")
async def feedback(response: Response, request: Request, data: dict ):
    return await record_feedback(request, response)

@router.post("/chat-feedback")
async def chat_feedback(request: Request, response: Response, data: dict):
    """
    Endpoint to record feedback for a specific chat message.

    Expected `data` format:
    {
        "messageId": "some_message_id",
        "upvote": 1  # 1 (good), -1 (bad), 0 (neutral)
    }
    """
    return await record_chat_feedback(request, response, data)