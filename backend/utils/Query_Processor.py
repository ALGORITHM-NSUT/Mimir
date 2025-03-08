from constants.Query_refine import Query_refine_prompt
from constants.Context_sufficient import Context_sufficient_prompt
from bson import ObjectId
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
import time
from constants.Gemini_search_prompt import Gemini_search_prompt
from constants.Query_expansion import Query_expansion_prompt
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from pymongo import MongoClient
import os
import google.generativeai as genai
from dotenv import load_dotenv
from langchain_groq import ChatGroq
import json
from constants.Gemini_system_prompt import GEMINI_PROMPT
from motor.motor_asyncio import AsyncIOMotorClient
import re
import asyncio
from pymongo.errors import OperationFailure
import random
from google.api_core.exceptions import GoogleAPIError, ResourceExhausted


load_dotenv()
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
MONGO_URI_MIMIIR = os.getenv("MONGO_URI_MIMIR")
chat_model = ChatGroq(model_name="llama-3.3-70b-specdec")
mongoDb_client = AsyncIOMotorClient(MONGO_URI_MIMIIR)


client = genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash", system_instruction= GEMINI_PROMPT)

class QueryProcessor:
            def __init__(self):
                self.embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
                self.client = mongoDb_client
                self.db = self.client["Docs"]
                self.documents = self.db.documents
                self.chunks = self.db.chunks
                self.current_date = datetime.now().isoformat()
                self.search_prompt = Gemini_search_prompt

            async def process_query(self, question: str):
                """Iterative retrieval process with dynamic query adjustment"""
                context_entries = []
                seen_ids = set()
                seen_ids.add(ObjectId("aaaaaaaaaaaaaaaaaaaaaaaa"))
                query_variations, keywords = self._expand_query(question)
                all_queries = query_variations
                knowledge = ""
                full_context = ""
                for iteration in range(3):
                    chunk_results = await self._search_in_chunks(all_queries, seen_ids, iteration + 1)
                    new_chunks = await self._process_chunks(chunk_results, seen_ids)

                    iteration_context = self._format_context(new_chunks, self.current_date)
                    context_entries.append(iteration_context)
                    full_context += iteration_context + "\n\n"
                    
                    if self._is_context_sufficient(question, full_context, keywords):
                        print(f"Stopping early at iteration {iteration+1}")
                        break

                    query_variation, part_knowledge = self._refine_queries(question, iteration_context, all_queries, keywords)
                    all_queries = [query_variation]
                    knowledge += part_knowledge
                    keywords.append(part_knowledge)
                return self._generate_final_answer(question, full_context, self.current_date, keywords)  
                

            async def _process_chunks(self, results: list, seen_ids: set) -> list:
                """Process chunks with parent document linking asynchronously"""
                processed = []
                results.sort(key=lambda chunk: chunk["chunk_num"])
                docs = {chunk["doc_id"] for chunk in results}
                for doc in docs:
                    parent_doc = await self.documents.find_one({"_id": doc}) or {}
                    metadata = {k: v for k, v in parent_doc.items()
                                if k not in ["sections", "content", "summary", "_id", "embedding"]}
                    
                    content = ""
                    for chunk in results:
                        if chunk["doc_id"] == doc:
                            overall = chunk["text"].split("\n\n")
                            rest_text = "\n\n".join(overall[2:])
                            if content == "":
                                summary = overall[1]
                                content += summary + "\n\n"
                            content += f"chunk number: {chunk['chunk_num']}\n{rest_text}\n\n"
                    processed.append(("document", content, metadata))
                return processed


            def _format_context(self, items: list, current_date: str) -> str:
                """Structure context for LLM comprehension"""
                context = []
                for item_type, content, meta in items:
                    meta["Publish Date"] = meta["Publish Date"].isoformat()
                    context.append(
                        f"Content: {content}\n"
                        f"Metadata: {json.dumps(meta, indent=2)}\n"
                    )
                return "\n".join(context)
            
            async def search_query(self, query, seen_ids, minscore, limit):
                """Search query with MongoDB quota handling"""
                query_vector = self._get_vector(query)
                pipeline = [
                    {
                        "$vectorSearch": {
                            "queryVector": query_vector,
                            "path": "embedding",
                            "filter": {"_id": {"$nin": list(seen_ids)}},
                            "numCandidates": 5000,
                            "limit": limit,
                            "index": "vector_index"
                        }
                    },
                    {"$addFields": {"score": {"$meta": "vectorSearchScore"}}},
                    {"$sort": {"score": -1}},
                    {"$match": {"score": {"$gte": minscore}}}
                ]

                for attempt in range(5):  # Retry up to 5 times
                    try:
                        cursor = self.chunks.aggregate(pipeline)
                        return [doc async for doc in cursor]
                    
                    except OperationFailure as e:
                        print(f"MongoDB OperationFailure: {e}, retrying...")
                    
                    except asyncio.TimeoutError:
                        print(f"MongoDB Timeout, retrying attempt {attempt+1}...")
                    
                    time.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff

                raise Exception("MongoDB search failed after multiple retries.")

            async def _search_in_chunks(self, queries: list, seen_ids: set, iteration: int) -> list:
                chunk_results = []
                minscore = 0.75
                limit = 20

                async def search_query(query):
                    return await self.search_query(query, seen_ids, minscore, limit)

                tasks = [search_query(query) for query in queries]
                results = await asyncio.gather(*tasks)

                for result in results:
                    for doc in result:
                        doc_id = doc["_id"]
                        if doc_id not in seen_ids:
                            seen_ids.add(doc_id)
                            chunk_results.append(doc)
                return chunk_results




            def _expand_query(self, query: str) -> list:
                """Generate initial query variations with API quota handling"""
                prompt = Query_expansion_prompt.format(query=query, current_date=self.current_date)

                for attempt in range(5):  # Retry up to 5 times
                    try:
                        text = model.generate_content(prompt).text
                        match = re.search(r'\{.*\}', text, re.DOTALL)
                        if not match:
                            raise ValueError("Failed to extract JSON from model response")
                        
                        json_data = json.loads(match.group(0))
                        return [query] + json_data.get("queries", []), json_data.get("keywords", [])
                    
                    except (json.JSONDecodeError, ValueError) as e:
                        print(f"Error parsing response: {e}, retrying...")

                    except ResourceExhausted:
                        print(f"Quota exceeded, retrying after delay...")
                        time.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff

                    except GoogleAPIError as e:
                        print(f"Google API error: {e}")
                        break  # If it's an unknown API error, don't retry

                raise Exception("Failed after multiple retries due to API quota limits.")

            

            def _refine_queries(self, original: str, context: str, all_queries: list, keywords: list) -> list:
                """Generate follow-up queries based on gaps"""
                prompt = Query_refine_prompt.format(
                    original = original,
                    all_queries = all_queries,
                    keywords = keywords,
                    context = context,
                    current_date = self.current_date
                )
                reasoned = model.generate_content(prompt).text
                print(reasoned)
                print("\n")
                json_data = json.loads(reasoned[reasoned.find('{'):reasoned.rfind('}')+1])
                # print(json_data)
                return json_data["query"], json_data["knowledge"]

            def _is_context_sufficient(self, question: str, context: str, keywords: list) -> bool:
                """LLM-powered context evaluation"""
                prompt = Context_sufficient_prompt.format(
                    question = question,
                    keywords = keywords,
                    context = context,
                    current_date = self.current_date
                )
                answer = model.generate_content(prompt).text.upper()
                x = "YES" in answer
                print("\n\n" + answer + "\n\n")
                return x

            def _generate_final_answer(self, question: str, context: str, current_date: str, keywords: list) -> dict:
                """Generate and format final response"""
                response = model.generate_content(
                    self.search_prompt.format(question=question, context=context, current_date=current_date, keywords=keywords)
                ).text
                
                match = re.search(r'\{.*\}', response, re.DOTALL)  # Extract JSON safely
                if not match:
                    raise ValueError("Failed to extract JSON from model response")
                
                json_data = json.loads(match.group(0))
                return {
                    "answer": json_data.get("answer", "No answer found."),
                    "links": json_data.get("links", []),
                    "context": context
                }


            def _get_vector(self, text: str):
                """Generate embedding with proper error handling"""
                return self.embeddings.embed_query(text)