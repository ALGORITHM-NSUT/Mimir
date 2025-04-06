import os
import google.generativeai as genai
from dotenv import load_dotenv
import asyncio
import json
from utils.Query_Processor import QueryProcessor
import re
import time
import google.api_core.exceptions
import traceback
from google.genai.types import Content

load_dotenv()
qp = QueryProcessor()

async def response_strategy(message: str, chat, is_deep_search=False):
    try:
        async def chat_with_bot(user_input):
            response = chat.send_message(user_input)
            return response.text

        async def interactive_chat(user_input=message):
            if not user_input.strip():
                return {"response": "Empty input", "references": [], "code": 200}
            json_data = {}
            retries = 3  # Number of retries for quota errors
            base_delay = 2  # Initial delay in seconds
            for attempt in range(retries):
                try:
                    bot_reply = await chat_with_bot(user_input)
                    print(bot_reply)
                    match = re.search(r'\{.*\}', bot_reply, re.DOTALL)
                    if match:
                        bot_reply = match.group(0)
                        json_data = json.loads(bot_reply)
                    else:
                        raise ValueError("No JSON-like structure found in the response.")
                    if not bot_reply:
                        raise ValueError("Empty response from the model.")
                    if bot_reply.startswith("Error:"):
                        raise ValueError(f"Model error: {bot_reply}")
                    break
                except (google.api_core.exceptions.ResourceExhausted, ValueError) as e:
                    if attempt == retries - 1:
                        return {"response": "Service unavailable due to quota limits. Please try again later.", "references": [], "code": 429}
                    wait_time = base_delay * (2 ** attempt)
                    print(f"Quota exceeded, retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                except Exception as e:
                    print(f"Unexpected error: {e}")
                    raise
            

            answer = {}  # Initialize answer dictionary here
            
            if json_data.get("retrieve"):
                answer = await qp.process_query(json_data["original_augmented_query"], json_data["action_plan"], json_data["document_level"], is_deep_search)
                answer["retrieve"] = True
                chat.record_history(
                    user_input = "",
                    model_output=[Content(parts=[{"text": json.dumps(answer, indent=2)}], role="model")],
                    is_valid=True,
                    automatic_function_calling_history=None
                )
            else:
                answer["retrieve"] = False
                answer["answer"] = json_data.get("answer", "No answer found.")
                answer["links"] = []
            
            return {"response": answer["answer"], "references": answer["links"], "code": 200}

        return await interactive_chat(message)
    except google.api_core.exceptions.ResourceExhausted:
        return {
            "response": "The server is currently experiencing High demand. Please wait before trying again.",
            "references": [],
            "code": 429
        }
    except Exception as e:
        detailed_error = traceback.format_exc()
        return {
            "response": "The server is currently experiencing High demand. Please wait before trying again.",
            "references": [],
            "code": 400
        }
