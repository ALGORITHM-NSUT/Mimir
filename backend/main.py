from fastapi import FastAPI
from routes.chat_routes import router as chat_router
from routes.Reference_route import router as reference_router
from routes.auth_routes import router as auth_router
from routes.feedback_route import router as feedback_router

from middleware.cors import setup_cors
import uvicorn

app = FastAPI()

setup_cors(app)

@app.get("/", tags=["Health Check"])
async def health_check():
  return {
    "message" : "Working Fine"
  }

app.include_router(chat_router, prefix="/api/chat", tags= ["Chat Management"]) 
app.include_router(reference_router, prefix="/api/ref", tags= ["File Proxy"]) 
app.include_router(auth_router, prefix="/api/auth", tags= ["Authentication"]) 
app.include_router(feedback_router, prefix="/api/feedback", tags= ["Feedback"]) 








