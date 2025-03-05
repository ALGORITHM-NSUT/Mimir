import os
import google.generativeai as genai
from dotenv import load_dotenv
import asyncio
import langchain_core
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
import json
from constants.Gemini_system_prompt import GEMINI_PROMPT
from constants.Semantic_cache_prompt import Semantic_cache_prompt
from utils.Query_Processor import QueryProcessor
import re
import time
import google.api_core.exceptions

load_dotenv()

GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
chat_model = ChatGroq(model_name="llama-3.3-70b-versatile")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash", system_instruction=GEMINI_PROMPT)
qp = QueryProcessor()

async def response_strategy(message: str, chatHistory: list):
    try:
        memory = ConversationBufferMemory(memory_key="history", return_messages=True)
        conversation = ConversationChain(llm=chat_model, memory=memory)
        conversation.memory.clear()
        conversation.memory.chat_memory.add_messages(chatHistory)

        system_prompt = Semantic_cache_prompt
        memory.chat_memory.add_message(langchain_core.messages.SystemMessage(content=system_prompt))

        async def chat_with_bot(user_input):
            bot_response = conversation.predict(input=user_input)
            return bot_response

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
                conversation.memory.chat_memory.messages = conversation.memory.chat_memory.messages[:-1]
                answer = await qp.process_query(json_data["query"])
                answer["retrieve"] = True
                conversation.memory.chat_memory.add_messages([
                    langchain_core.messages.AIMessage(
                        answer["answer"] + "\nLinks:\n" +
                        "\n".join(f"{link['title']}: {link['link']}" for link in answer["links"])
                        if answer.get("links") else ""
                    )
                ])
            else:
                answer["retrieve"] = False
                answer["answer"] = json_data.get("answer", "No answer found.")
                answer["links"] = json_data.get("links", [])
            
            print(answer["answer"])
            return {"response": answer["answer"], "references": answer["links"]}

        return await interactive_chat(message)
    except google.api_core.exceptions.ResourceExhausted:
        return {"response": "Quota limit exceeded. Please wait before trying again.", "references": []}
    except Exception as e:
        return {"response": f"Error generating AI response: {str(e)}", "references": []}