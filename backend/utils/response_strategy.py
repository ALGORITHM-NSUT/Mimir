import os
import google.generativeai as genai
from dotenv import load_dotenv
import asyncio
import json
from constants.Gemini_system_prompt import GEMINI_PROMPT
from constants.Semantic_cache_prompt import Semantic_cache_prompt
from utils.Query_Processor import QueryProcessor
import re
import time
import google.api_core.exceptions
import traceback

load_dotenv()

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini model with the system prompt.
model = genai.GenerativeModel("gemini-2.0-flash-lite", system_instruction=GEMINI_PROMPT)
qp = QueryProcessor()

async def response_strategy(message: str, chatHistory: list):
    """
    Process a new user message by converting chatHistory (a list of dicts with "role" and "content")
    into a single string prompt, appending the new user message, and then calling the Gemini API.
    
    The final output includes:
      - "response": the answer string,
      - "references": any reference links,
      - "chatHistory": the updated conversation string.
    """
    # Start with the system prompt. We use Semantic_cache_prompt here.
    conversation = f"System: {Semantic_cache_prompt}\n"
    
    # Convert each item in chatHistory (assumed dict with keys "role" and "content") into a string.
    for entry in chatHistory:
        role = entry.get("role", "user").capitalize()
        content = entry.get("content", "")
        conversation += f"{role}: {content}\n"
    
    # Append the new user message.
    conversation += f"User: {message}\n"
    
    try:
        # Retry logic for quota errors.
        retries = 3
        base_delay = 2  # seconds
        for attempt in range(retries):
            try:
                # Use the generate_content function which accepts a string.
                bot_response = model.generate_content(
                    contents=conversation,
                    generation_config=genai.GenerationConfig(
                        top_k=10,
                        top_p=0.6,
                        temperature=0.5,
                    )
                )
                break  # exit retry loop if successful
            except google.api_core.exceptions.ResourceExhausted:
                if attempt == retries - 1:
                    return {
                        "response": "Service unavailable due to quota limits. Please try again later.",
                        "references": [],
                        "chatHistory": conversation
                    }
                wait_time = base_delay * (2 ** attempt)
                print(f"Quota exceeded, retrying in {wait_time} seconds...")
                await asyncio.sleep(wait_time)
        
        # Retrieve the text output.
        bot_reply = bot_response.text
        
        # Extract JSON from the bot reply using regex.
        def extract_json(text):
            match = re.search(r'\{.*\}', text, re.DOTALL)
            return match.group(0) if match else None

        json_string = extract_json(bot_reply)
        if not json_string:
            raise ValueError(f"Failed to extract JSON from bot_reply: {bot_reply}")

        json_data = json.loads(json_string)
        answer = {}

        # If retrieval is requested, process the query accordingly.
        if json_data.get("retrieve", "").lower() == "true":
            answer = await qp.process_query(json_data["query"])
            answer["retrieve"] = True
            assistant_response = (
                answer["answer"] +
                "\nLinks:\n" +
                "\n".join(f"{link['title']}: {link['link']}" for link in answer.get("links", []))
            )
        else:
            answer["retrieve"] = False
            answer["answer"] = json_data.get("answer", "No answer found.")
            answer["links"] = json_data.get("links", [])
            assistant_response = (
                answer["answer"] +
                "\nLinks:\n" +
                "\n".join(f"{link['title']}: {link['link']}" for link in answer.get("links", []))
            )
        
        # Append the assistant's reply to the conversation string.
        conversation += f"Assistant: {assistant_response}\n"
        
        return {
            "response": answer["answer"],
            "references": answer.get("links", []),
            "chatHistory": conversation
        }
    
    except google.api_core.exceptions.ResourceExhausted:
        return {
            "response": "Quota limit exceeded. Please wait before trying again.",
            "references": [],
            "chatHistory": conversation
        }
    except Exception as e:
        detailed_error = traceback.format_exc()
        print("Detailed error:", detailed_error)
        return {
            "response": f"Error generating AI response: {str(e)}",
            "references": [],
            "chatHistory": conversation
        }
