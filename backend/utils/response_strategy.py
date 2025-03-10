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
from together import Together

load_dotenv()

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
# chat_model = ChatGroq(model_name="llama-3.3-70b-specdec")

client = Together(api_key=os.getenv('TOGETHER_API_KEY'))
messages = [{"role": "system", "content": Semantic_cache_prompt}]
model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash", system_instruction=GEMINI_PROMPT)
qp = QueryProcessor()

async def response_strategy(message: str, chatHistory: list):
    try:
        async def chat_with_bot(user_input):
            messages.append({"role": "user", "content": user_input})
            bot_response = client.chat.completions.create(
                model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                messages=messages,
                max_tokens=None,
                temperature=0.7,
                top_p=0.7,
                top_k=50,
                repetition_penalty=1,
                stop=["<|eot_id|>","<|eom_id|>"],
                stream=False
            )
            return bot_response.choices[0].message.content

        async def interactive_chat(user_input=message):
            if not user_input.strip():
                return {"response": "Empty input", "references": []}
            
            retries = 3  # Number of retries for quota errors
            base_delay = 2  # Initial delay in seconds
            for attempt in range(retries):
                try:
                    bot_reply = await chat_with_bot(user_input)
                    break
                except google.api_core.exceptions.ResourceExhausted:
                    if attempt == retries - 1:
                        return {"response": "Service unavailable due to quota limits. Please try again later.", "references": []}
                    wait_time = base_delay * (2 ** attempt)
                    print(f"Quota exceeded, retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
            
            def extract_json(text):
                match = re.search(r'\{.*\}', text, re.DOTALL)
                return match.group(0) if match else None
            
            json_string = extract_json(bot_reply)
            if not json_string:
                raise ValueError(f"Failed to extract JSON from bot_reply: {bot_reply}")
            
            json_data = json.loads(json_string)
            answer = {}
            if json_data.get("retrieve", "").lower() == "true":
                answer = await qp.process_query(json_data["query"])
                answer["retrieve"] = True
                messages.append({ "role": "assistant", 
                    "content":
                        answer["answer"] + "\nLinks:\n" +
                        "\n".join(f"{link['title']}: {link['link']}" for link in answer["links"])
                        if answer.get("links") else ""
                })
            else:
                answer["retrieve"] = False
                answer["answer"] = json_data.get("answer", "No answer found.")
                answer["links"] = json_data.get("links", [])
            
            return {"response": answer["answer"], "references": answer["links"]}

        return await interactive_chat(message)
    except google.api_core.exceptions.ResourceExhausted:
        return {"response": "Quota limit exceeded. Please wait before trying again.", "references": []}
    except Exception as e:
        detailed_error = traceback.format_exc()
        print("Detailed error:", detailed_error)
        return {"response": f"Error generating AI response: {str(e)}", "references": []}