from fastapi import Request, Response, HTTPException
from utils.db import db 

feedback_collection = db["feedback"]  
messages_collection = db["messages"]
async def record_feedback(request: Request, response: Response):
    try:
        data = await request.json()
        accuracy = data.get("accuracy")
        performance = data.get("performance")
        feedback = data.get("feedback")
        user = data.get("user")

        if not all([accuracy, performance, feedback, user]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        feedback_entry = {
            "accuracy": accuracy,
            "performance": performance,
            "feedback": feedback,
            "user": user
        }

        feedback_collection.insert_one(feedback_entry)  

        return {"message": "Feedback recorded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

async def record_chat_feedback(request: Request, response: Response, data: dict):

    message_id = data.get("messageId")
    upvote = data.get("upvote")

    if message_id is None or upvote not in {1, 0, -1}:
        response.status_code = 400
        return {"error": "Invalid request. 'messageId' is required and 'upvote' must be 1, 0, or -1."}


    # Update the existing message document with feedback
    result = await messages_collection.update_one(
        {"messageId": message_id},
        {"$set": {"upvote": upvote}},
        upsert=True  # Create the document if it doesn't exist
    )

    return {
        "message": "Feedback recorded successfully.",
        "matched_count": result.matched_count,
        "modified_count": result.modified_count,
    }
