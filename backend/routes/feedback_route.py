from fastapi import APIRouter, Response, Request
from controllers.feedback_controller import record_feedback

router = APIRouter()

@router.post("/record")
async def feedback(response: Response, request: Request, data: dict ):
    return await record_feedback(request, response)
