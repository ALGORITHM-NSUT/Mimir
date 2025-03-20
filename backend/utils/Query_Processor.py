from bson import ObjectId
from datetime import datetime
import time
from constants.Gemini_search_prompt import Gemini_search_prompt
from constants.Query_expansion import Query_expansion_prompt
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os
from dotenv import load_dotenv
import json
from constants.Gemini_system_prompt import GEMINI_PROMPT
from motor.motor_asyncio import AsyncIOMotorClient
import re
import asyncio
from pymongo.errors import OperationFailure
import random
from google.api_core.exceptions import GoogleAPIError, ResourceExhausted
from models.chat_model import expand, answer
from google import genai
from google.genai import types

load_dotenv()
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
MONGO_URI_MIMIIR = os.getenv("MONGO_URI_MIMIR")
mongoDb_client = AsyncIOMotorClient(MONGO_URI_MIMIIR)

llm = "gemini-2.0-flash"
client = genai.Client(api_key=GEMINI_API_KEY)

class QueryProcessor:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        self.client = mongoDb_client
        self.db = self.client["Docs"]
        self.documents = self.db.documents
        self.chunks = self.db.chunks
        self.current_date = datetime.now().date().isoformat()
        self.search_prompt = Gemini_search_prompt

    async def process_query(self, question: str, user_knowledge: str):
        """Iterative retrieval process with dynamic query adjustment"""
        context_entries = []
        seen_ids = set()
        seen_ids.add(ObjectId("aaaaaaaaaaaaaaaaaaaaaaaa"))
        plan = await self._expand_query(question, user_knowledge)
        knowledge = ""
        max_iter = 5
        ans = {}
        step = 1
        queries = plan[step - 1]["specific_queries"]
        for iteration in range(max_iter):
            doc_queries = []
            if (step != -1):
                doc_queries = plan[step - 1]["document_queries"]
            doc_ids = await self._search_docs(doc_queries) if len(doc_queries) != 0 else []

            chunk_results, current_ids = await self._search_in_chunks(queries, seen_ids, doc_ids, iteration + 1)

            iteration_context = self._format_context(chunk_results, current_ids)
            context_entries.append(iteration_context)
            # print(iteration_context)
            # full_context += iteration_context + "\n\n"
            ans = await self._generate_answer(question, iteration_context, self.current_date, plan, knowledge, max_iter - 1, iteration, user_knowledge, step)  
            if ans["full_answer"]:
                print(f"Stopping early at iteration {iteration+1}")
                return ans
            else:
                print(ans)
            if iteration == max_iter - 1:
                print(f"could not find ans, returning relevant info")
                return ans
            knowledge = ans["knowledge"]
            step = ans["step"]
            print("next step", step)
            queries = ans["queries"]

        return ans  
        

    def _process_chunks(self, docs: set, all_results: list, chunk_query_mapping: dict) -> list:
        processed = []
        for doc in docs:
            metadata = {}
            content = ""
            pages_added = set()
            page_summaries = []  # will hold the list from metadata later

            for chunk in all_results:
                if str(chunk["doc_id"]) == doc:
                    # On first encounter, initialize metadata and extract page summaries
                    if not metadata:
                        metadata = chunk["doc_info"][0]
                        metadata["Publish Date"] = metadata["Publish Date"].date().isoformat()
                        # Ensure document-level summary is added as a field.
                        metadata["summary"] = metadata.get("summary", "")
                        # Extract the list of page summaries (0-indexed list)
                        page_summaries = metadata.get("page_summaries", [])
                        
                    page = chunk["page"]
                    # Add page summary only once per page.
                    if page not in pages_added and (page - 1) < len(page_summaries):
                        content += (
                            f"page summary for page {page}: {page_summaries[page - 1]}\n\n"
                        )
                        pages_added.add(page)
                        
                    # Append chunk details.
                    content += (
                        f"chunk number: {chunk['chunk_num']}\n"
                        f"{chunk['text']}\n"
                    )
                    if "table_summary" in chunk and chunk["table_summary"]:
                        content += f"table summary: {chunk['table_summary']}\n"

                    content += "\n"
                    
            if content and metadata:
                metadata["content"] = content
            processed.append(metadata)
        return processed


    def _format_context(self, items: list, docs: set) -> str:
        """Structure context for LLM comprehension"""
        context = "Document Chunks: \n\n"
        for doc in items:
            meta = json.dumps(doc, indent=2)
            context += f"{meta}\n\n"
        return context
    
    async def _doc_query(self, query: str, limit: int) -> list:
        doc_query_vector = self._get_vector(query)
        pipeline = [
            {
                "$vectorSearch": {
                    "queryVector": doc_query_vector,
                    "path": "summary_embedding",
                    "numCandidates": 500,
                    "limit": limit,
                    "index": "vector_index"
                }
            },
            {
                "$project": {
                    "_id": 1
                }
            }
        ]
        result = self.documents.aggregate(pipeline)
        return [doc["_id"] async for doc in result]

    async def _search_docs(self, queries: list) -> list:
        """Search documents based on query string"""
        limit = 50
        async def doc_query(query):
            return await self._doc_query(query, limit)
        tasks = {query: asyncio.create_task(doc_query(query)) for query in queries}
        results_list = await asyncio.gather(*tasks.values())
        results = [item for sublist in results_list for item in sublist]
        resultset = set(results)
        results = list(resultset)
        return results

    async def _search_query(self, query: str, seen_ids: set, minscore: float, vector_weight: float, full_text_weight: float, limit: int, keywords: list, doc_ids: list) -> list:
        """Search query with MongoDB quota handling"""
        query_vector = self._get_vector(query)
        pipeline = [
            {
                "$vectorSearch": {
                    "queryVector": query_vector,
                    "path": "embedding",
                    "numCandidates": 5000,
                    "limit": limit,
                    "index": "vector_index"
                }
            },
            {"$addFields": {"vs_score": {"$meta": "vectorSearchScore"}}},
            {"$sort": { "vs_score": -1 }},
            {"$match": {"vs_score": {"$gte": minscore}}},
            {
                "$group": {
                    "_id": None,
                    "docs": {"$push": "$$ROOT"}
                }
            },
            {
                "$unwind": {
                    "path": "$docs",
                    "includeArrayIndex": "rank"
                }
            },
            {
                "$addFields": {
                    "vs_score": {
                        "$multiply": [
                            vector_weight,
                            {"$divide": [1.0, {"$add": ["$rank", 60]}]}
                        ]
                    }
                }
            },
            {
                "$project": {
                    "_id": "$docs._id",
                    "doc_id": "$docs.doc_id",
                    "vs_score": 1,
                    "chunk_id": "$docs.chunk_id",
                    "text": "$docs.text",
                    "page": "$docs.page",
                    "chunk_num": "$docs.chunk_num",
                    "table_summary": "$docs.table_summary"
                }
            },
            {
                "$unionWith": {
                    "coll": "chunks",
                    "pipeline": [
                        {
                            "$search": {
                                "index": "text",
                                "compound": {
                                    
                                    "must": [
                                        
                                    ],
                                    "mustNot": [
                                        {
                                            "in": {
                                            "path": "_id",
                                            "value": list(seen_ids)
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {"$limit": limit},
                        {
                            "$group": {
                                "_id": None,
                                "docs": {"$push": "$$ROOT"}
                            }
                        },
                        {
                            "$unwind": {
                                "path": "$docs",
                                "includeArrayIndex": "rank"
                            }
                        },
                        {
                            "$addFields": {
                                "fts_score": {
                                    "$multiply": [
                                        full_text_weight,
                                        {"$divide": [1.0, {"$add": ["$rank", 60]}]}
                                    ]
                                }
                            }
                        },
                        {
                            "$project": {
                                "_id": "$docs._id",
                                "doc_id": "$docs.doc_id",
                                "fts_score": 1,
                                "chunk_id": "$docs.chunk_id",
                                "text": "$docs.text",
                                "page": "$docs.page",
                                "chunk_num": "$docs.chunk_num",
                                "table_summary": "$docs.table_summary"
                            }
                        },
                        {"$sort": {"fts_score": -1}},
                        {"$limit": limit},
                    ]
                }
            },
            {
                "$group": {
                    "_id": "$_id",
                    "vs_score": {"$max": "$vs_score"},
                    "fts_score": {"$max": "$fts_score"},
                    "doc_id": {"$first": "$doc_id"},
                    "chunk_id": {"$first": "$chunk_id"},
                    "text": {"$first": "$text"},
                    "page": {"$first": "$page"},
                    "chunk_num": {"$first": "$chunk_num"},
                    "table_summary": {"$first": "$table_summary"}
                }
            },
            {
                "$project": {
                    "vs_score": {"$ifNull": ["$vs_score", 0]},
                    "fts_score": {"$ifNull": ["$fts_score", 0]},
                    "score": {
                        "$add": [
                        {"$ifNull": ["$vs_score", 0]},
                        {"$ifNull": ["$fts_score", 0]}
                        ]
                    },
                    "doc_id": 1,
                    "chunk_id": 1,
                    "text": 1,
                    "page": 1,
                    "chunk_num": 1,
                    "table_summary": 1
                }
            },
            
            {
                "$lookup": {
                    "from": "documents",
                    "localField": "doc_id",
                    "foreignField": "_id",
                    "as": "doc_info"
                }
            },
            {
                "$project": {
                    "embedding": 0,
                    "doc_info.content": 0,
                    "doc_info.summary_embedding": 0,
                    "doc_info.sections": 0,
                    "doc_info.entities": 0,
                    "doc_info.doc_id": 0,
                    "doc_info._id": 0,
                    "chunk_id": 0
                }
            },
            {"$sort": {"score": -1}},
            {"$limit": limit}
        ]
        if keywords:
            pipeline[8]["$unionWith"]["pipeline"][0]["$search"]["compound"]["must"].append({"phrase": {"query": keywords, "path": "text"}})
        else:
            pipeline[8]["$unionWith"]["pipeline"][0]["$search"]["compound"]["must"].append({"text": {"query": query, "path": "text"}})
        
        if doc_ids:
            pipeline[8]["$unionWith"]["pipeline"][0]["$search"]["compound"]["must"].append({"in": {"path": "doc_id", "value": doc_ids}})
            pipeline[0]["$vectorSearch"]["filter"] = {"_id": {"$nin": list(seen_ids)}, "doc_id": {"$in": doc_ids}}
        else:
            pipeline[0]["$vectorSearch"]["filter"] = {"_id": {"$nin": list(seen_ids)}}


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

    async def _search_in_chunks(self, queries: list, seen_ids: set, doc_ids: list, iteration: int) -> list:
        minscore = 0.75
        limit = 20
        
        query_results = {}

        async def search_query(query):
            vector_weight = min(0.7, max(0.3, 1 - query["specifity"]))
            full_text_weight = 1 - vector_weight
            return await self._search_query(query["query"], seen_ids, minscore, vector_weight, full_text_weight, limit, query["keywords"], doc_ids)
            
        tasks = {query["query"]: asyncio.create_task(search_query(query)) for query in queries}
        results_list = await asyncio.gather(*tasks.values())
        results = {query: result for query, result in zip(tasks.keys(), results_list)}

        all_results = []
        chunk_query_mapping = {}
        for query, result in results.items():
            query_results[query] = []
            for chunk in result:
                chunk_id = chunk["_id"]
                if chunk_id not in seen_ids:
                    query_results[query].append(chunk)
                    seen_ids.add(chunk_id)
                    all_results.append(chunk)
                    chunk_query_mapping[chunk_id] = query
        all_results.sort(key= lambda chunk: chunk["chunk_num"])
        docs = {str(chunk["doc_id"]) for chunk in all_results}
        processed = self._process_chunks(docs, all_results, chunk_query_mapping)
        return processed, docs
    
    def _rerank(self, formatted: dict, question: str) -> list:
        """Generate reranking"""
        reranked = []
        trial = []
        for key, docs in formatted.items():
            trial.extend(docs)

        # response = self.Together_client.rerank.create(
        #     model="Salesforce/Llama-Rank-V1",
        #     query=question,
        #     documents=trial,
        #     rank_fields=["content", "Title", "Publish Date"],
        #     top_n=15
        # )

        # for result in response.results:
        #     reranked.append(trial[result.index])
        return trial
    
    async def _expand_query(self, query: str, user_knowledge: str) -> list:
        """Generate initial query variations with API quota handling"""
        prompt = Query_expansion_prompt.format(query=query, current_date=self.current_date, user_knowledge=user_knowledge)

        for attempt in range(5):  # Retry up to 5 times
            try:
                response = client.models.generate_content(model = llm, contents=[prompt],
                config=types.GenerateContentConfig(
                system_instruction=GEMINI_PROMPT,
                response_mime_type='application/json',
                response_schema=expand)).text
                # match = re.search(r'\{.*\}', text, re.DOTALL)
                # if not match:
                #     raise ValueError("Failed to extract JSON from model response")
                # json_data = json.loads(match.group(0))
                
                try:
                    json_data = json.loads(response)
                    print(json_data)
                except:
                    raise ValueError("Failed to extract JSON from model response")
                return json_data["action_plan"]
                        
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing response: {e}, retrying...")

            except ResourceExhausted:
                print(f"Quota exceeded, retrying after delay...")
                time.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff

            except GoogleAPIError as e:
                print(f"Google API error: {e}")
                break  # If it's an unknown API error, don't retry

        raise Exception("Failed after multiple retries due to API quota limits.")

    async def _generate_answer(self, question: str, context: str, current_date: str, plan: dict, knowledge: str, max_iter: int, iteration: int, user_knowledge: str, step: int) -> dict:
        """Generate and format final response"""
        response = client.models.generate_content(
            model = llm,
            contents = [self.search_prompt.format(question=question,
                context=context,
                current_date=current_date,
                action_plan=plan,
                knowledge=knowledge,
                max_iter=max_iter,
                iteration=iteration,
                user_knowledge=user_knowledge,
                step=step,
                specific_queries=plan[step - 1]["specific_queries"])],
            config=types.GenerateContentConfig(
                system_instruction=GEMINI_PROMPT,
                response_mime_type='application/json',
                response_schema=answer,
                temperature=0.2)
            ).text
        
        # match = re.search(r'\{.*\}', response, re.DOTALL)  # Extract JSON safely
        # if not match:
        #     raise ValueError("Failed to extract JSON from model response")
        try:
            json_data = json.loads(response)
        except:
            raise ValueError("Failed to extract JSON from model response")
        return json_data


    def _get_vector(self, text: str):
        """Generate embedding with proper error handling"""
        return self.embeddings.embed_query(text)