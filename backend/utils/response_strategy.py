import os
import google.generativeai as genai
from dotenv import load_dotenv
import asyncio

# Load API key from .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize Gemini Client & Chat Session
client = genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

async def response_strategy(message: str, chatHistory: list):
    try:

        systemPrompt = """
           You are a normal LLm
        """

        chat_context = f"""
            {{"role": "system", "content": "take it as context to answer the user query "{systemPrompt}}}
            {{"role": "user", "content": {message}, "history": {chatHistory}}}
        
        """

        response = await asyncio.to_thread(model.generate_content, chat_context)
        response_text = response.text

        references = [
            {"title": "Distributed Database", "url": "https://www.instagram.com/"},
            {"title": "Soft Computing", "url": "https://www.fallingfalling.com/"},
        ]

        return {"response": response_text, "references": references}

    except Exception as e:
        raise Exception(f"Error generating AI response: {str(e)}")
