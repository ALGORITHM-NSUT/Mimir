from fastapi import FastAPI
from routes.chat_routes import router as chat_router
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





