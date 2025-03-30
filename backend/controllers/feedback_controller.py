from fastapi import Request, Response, HTTPException
from utils.db import db 

feedback_collection = db["feedback"]  
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
