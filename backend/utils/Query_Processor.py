from bson import ObjectId
from datetime import datetime
import time
from constants.Gemini_search_prompt import Gemini_search_prompt
from constants.Query_expansion import Query_expansion_prompt
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
from google import genai
from google.genai import types
from google.genai.errors import ServerError
from google.genai.types import EmbedContentConfig
import requests
from models.chat_model import answer, expand


# config_quick_search = types.GenerateContentConfig(
#                         system_instruction=GEMINI_PROMPT,
#                         response_mime_type='application/json',
#                         response_schema=expand,
#                         temperature=0.2)

# config_thinking  = types.GenerateContentConfig(
#                         system_instruction=GEMINI_PROMPT,
#                         temperature=0.2)


load_dotenv()
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
MONGO_URI_MIMIIR = os.getenv("MONGO_URI_MIMIR")
JINA_API_KEY = os.getenv("JINA_API_KEY")
mongoDb_client = AsyncIOMotorClient(MONGO_URI_MIMIIR)


# Thinking Model

llm2 = "gemini-2.0-flash-thinking-exp-01-21"
# Action Model for quick search
llm = "gemini-2.0-flash"

client = genai.Client(api_key=GEMINI_API_KEY)

MAX_RETRIES = 3

def _retry_on_error(func):
    async def wrapper(*args, **kwargs):
        for attempt in range(MAX_RETRIES):
            try:
                return await func(*args, **kwargs)
            except (OperationFailure, ResourceExhausted) as e:
                print(f"Error in {func.__name__}: {e}, retrying...")
                await asyncio.sleep(2 ** attempt + random.uniform(0, 1))
            except GoogleAPIError as e:
                print(f"Google API error in {func.__name__}: {e}")
                return None
            except json.JSONDecodeError:
                print(f"JSON parsing error in {func.__name__}, retrying...")
                await asyncio.sleep(2 ** attempt + random.uniform(0, 1))
            except Exception as e:
                print(f"Unexpected error in {func.__name__}: {e}")
                return None
        raise Exception(f"{func.__name__} failed after multiple retries.")
    return wrapper

class QueryProcessor:
    def __init__(self):
        self.client = mongoDb_client
        self.db = self.client["Docs"]
        self.documents = self.db.documents
        self.chunks = self.db.chunks
        self.current_date = datetime.now().date().isoformat()
        self.search_prompt = Gemini_search_prompt

    async def process_query(self, question: str, user_knowledge: str, is_deep_search: bool = False):
        """Iterative retrieval process with dynamic query adjustment"""
        
        # Select model based on deep search flag
        
        model_to_use = llm2 if is_deep_search else llm
        
        print( " model to use  : ", model_to_use)
        
        retrycnt = 1
        
        
        context_entries = []
        seen_ids = set()
        seen_ids.add(ObjectId("aaaaaaaaaaaaaaaaaaaaaaaa"))
        plan = await self._expand_query(question, user_knowledge, model_to_use)
        knowledge = ""
        max_iter = 4
        ans = {}
        step = 1
        queries = plan[step - 1]["specific_queries"]
        doc_queries = plan[step - 1]["document_queries"]
        
        

        for iteration in range(max_iter):
            doc_ids = await self._search_docs(doc_queries) if doc_queries else []
            chunk_results, current_docids, seen_ids = await self._search_in_chunks(queries, seen_ids, doc_ids, iteration + 1)
            iteration_context = self._format_context(chunk_results)
            context_entries.append(iteration_context)
            start = time.time()
            ans = await self._generate_answer(
                question, 
                iteration_context, 
                self.current_date, 
                plan, 
                knowledge, 
                max_iter - retrycnt, 
                iteration + 1, 
                user_knowledge, 
                step, 
                retrycnt,
                model_to_use  # Pass the selected model
            )  
            end = time.time()
            print("gemini response time : ", end - start)
            
            if "final_answer" in ans and ans["final_answer"] :
                print(f"Stopping early at iteration {iteration+1}")
                return ans
            else:
                print(ans)
            if iteration == max_iter - 1:
                print(f"could not find ans, returning relevant info")
                return ans
            if "partial_answer" in ans and ans["partial_answer"] is not None:
                knowledge += str(ans["partial_answer"]) + "\n" 
            if "answer" in ans and ans["answer"] is not None:
                knowledge += str(ans["answer"]) + "\n"
            if "links" in ans and len(ans["links"]) != 0:
                knowledge = knowledge + " " + json.dumps(ans["links"], indent=2)
            
            if (ans["step"] == step):
                retrycnt -= 1
            
            step = ans["step"]
            doc_queries = ans["document_queries"]
            print("next step", step)
            queries = ans["specific_queries"]

        return ans  
        

    def _process_chunks(self, docs: set, all_results: list) -> list:
        doc_metadata_map = {}
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
                        content += f"page : {page} \n summary for page : {page_summaries[page - 1]}\n\n"
                        pages_added.add(page)
                        
                    # Append chunk details.
                    content += f"chunk number: {chunk['chunk_num']}\n" + f"{chunk['text']}\n"
                    if "table_summary" in chunk and chunk["table_summary"]:
                        content += f"table summary: {chunk['table_summary']}\n"

                    content += "\n"
                    
            if content and metadata:
                metadata["content"] = content
                doc_metadata_map[doc] = metadata

        sorted_documents = sorted(
            doc_metadata_map.values(), key=lambda x: x["Publish Date"], reverse=True
        )
        return sorted_documents


    def _format_context(self, items: list) -> str:
        """Structure context for LLM comprehension"""
        context = "Document Chunks: \n\n"
        for doc in items:
            meta = json.dumps(doc, indent=2)
            context += f"{meta}\n\n"
        return context
    
    async def _doc_query(self, doc_query_vector, limit: int, query: str) -> list:
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
                    "_id": 1,
                    "summary": 1,
                    "Publish Date": 1
                }
            }
        ]
        result = self.documents.aggregate(pipeline)
        docs = [{"_id" : doc["_id"], "summary" : doc["summary"], "Publish Date": doc["Publish Date"].date().isoformat()} async for doc in result]
        reranked = await self._rerank(docs, query, ["summary"])
        return reranked

    async def _search_docs(self, queries: list) -> list:
        """Search documents based on query string"""
        limit = 50
        async def doc_query(queryembed, query):
            return await self._doc_query(queryembed, limit, query)
        queryembeds = await self._get_vector(queries)
        tasks = [asyncio.create_task(doc_query(queryembeds[i], queries[i])) for i in range(len(queryembeds))]
        results_list = await asyncio.gather(*tasks)
        results = [item for sublist in results_list for item in sublist]
        resultset = set()
        for item in results:
            resultset.add(item["_id"])
        return list(resultset)

    async def _search_query(self, query_vector, seen_ids: set, minscore: float, vector_weight: float, full_text_weight: float, limit: int, doc_ids: list, query: str) -> list:
        """Search query with MongoDB quota handling"""
        pipeline = [
            {
                "$vectorSearch": {
                    "queryVector": query_vector,
                    "path": "embedding",
                    "numCandidates": 1000,
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
                    "_id": 1,
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
                    "chunk_id": 0,
                }
            },
            {"$sort": {"score": -1}},
            {"$limit": limit}
        ]
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
                # return await self._rerank(docs, query, ["text", "table_summary"])
            
            except OperationFailure as e:
                print(f"MongoDB OperationFailure: {e}, retrying...")
            
            except asyncio.TimeoutError:
                print(f"MongoDB Timeout, retrying attempt {attempt+1}...")
            
            time.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff

        raise Exception("MongoDB search failed after multiple retries.")

    async def _search_in_chunks(self, queries: list, seen_ids: set, doc_ids: list, iteration: int) -> list:
        minscore = 0.75

        async def search_query(query):
            limit = int(max(10, query["expansivity"] * 25))
            vector_weight = min(0.7, max(0.3, 1 - query["specificity"]))
            full_text_weight = 1 - vector_weight
            return await self._search_query(query["embedding"], seen_ids, minscore, vector_weight, full_text_weight, limit, doc_ids, query["query"])
        
        query_embedlist = []
        for query in queries:
            query_embedlist.append(query["query"])

        query_embeds = await self._get_vector(query_embedlist)

        for i in range(len(queries)):
            queries[i]["embedding"] = query_embeds[i]
        
        tasks = {query["query"]: asyncio.create_task(search_query(query)) for query in queries}
        results_list = await asyncio.gather(*tasks.values())
        results = {query: result for query, result in zip(tasks.keys(), results_list)}

        all_results = []
        for query, result in results.items():
            for chunk in result:
                chunk_id = chunk["_id"]
                if chunk_id not in seen_ids:
                    seen_ids.add(chunk_id)
                    all_results.append(chunk)
        all_results.sort(key= lambda chunk: chunk["chunk_num"])
        docs = {str(chunk["doc_id"]) for chunk in all_results}
        processed = self._process_chunks(docs, all_results)
        return processed, docs, seen_ids
    
    async def _rerank(self, docs: list, question: str, fields: list) -> list:
        """Generate reranking"""
        url = 'https://api.jina.ai/v1/rerank'
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + JINA_API_KEY
        }
        searchspace = ["\n".join(doc[field] for field in fields if field in doc and doc[field] is not None) for doc in docs]
        data = {
            "model": "jina-reranker-v2-base-multilingual",
            "query": question,
            "top_n": min(20, len(docs)),
            "documents": searchspace
        }
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            return [docs[result["index"]] for result in response.json()["results"] if result["relevance_score"] > 0.5]
        except Exception as e:
            raise Exception(f"Reranking failed, quota limit exceeded")
    
    async def _expand_query(self, query: str, user_knowledge: str, model_to_use: str) -> list:
        """Generate initial query variations with API quota handling"""
        prompt = Query_expansion_prompt.format(query=query, current_date=self.current_date, user_knowledge=user_knowledge)

        for attempt in range(5):
            try:
                response = client.models.generate_content(
                    model=model_to_use, 
                    contents=[prompt],
                    config=self._get_config(model_to_use, 'expand')).text
                match = re.search(r'\{.*\}', response, re.DOTALL)
                if not match:
                    raise ValueError("Failed to extract JSON from model response")
                
                try:
                    json_data = json.loads(match.group(0), strict = False)
                    print(json_data)
                    return json_data["action_plan"]
                except:
                    raise ValueError("Failed to extract JSON from model response")
                
                        
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing response: {e}, retrying...")

            except ResourceExhausted or ServerError:
                print(f"Quota exceeded, retrying after delay...")
                time.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff

            except GoogleAPIError as e:
                print(f"Google API error: {e}")
                break  # If it's an unknown API error, don't retry

        raise Exception("Failed after multiple retries due to API quota limits.")

        

    async def _generate_answer(self, question: str, context: str, current_date: str, plan: dict, knowledge: str, max_iter: int, iteration: int, user_knowledge: str, step: int, retrycnt: int, model_to_use: str = llm) -> dict:
        """Generate and format final response"""
        specific_queries = []
        if step != -1:
            step = min(step, len(plan) - 1)
            specific_queries = plan[step - 1]["specific_queries"]
        else:
            specific_queries = ["abandoned action plan in previous step directly searching user queries"]
        stepknowledge = ""
        if retrycnt == 0:
            stepknowledge += f"This is retry for step {step} of plan"
        else:
            stepknowledge += f"{step}"
        for attempt in range(MAX_RETRIES):
            try:
                response = client.models.generate_content(
                    model=model_to_use,
                    contents=[self.search_prompt.format(
                        question=question,
                        context=context,
                        current_date=current_date,
                        action_plan=plan,
                        knowledge=knowledge,
                        max_iter=max_iter,
                        iteration=iteration,
                        user_knowledge=user_knowledge,
                        step=stepknowledge,
                        specific_queries=specific_queries,
                        retries_left=retrycnt)],
                    config=self._get_config(model_to_use, 'answer')
                ).text
                
                match = re.search(r'\{.*\}', response, re.DOTALL)  # Extract JSON safely
                if not match:
                    raise ValueError("Failed to extract JSON from model response")
                try:
                    json_data = json.loads(match.group(0), strict = False)
                    return json_data
                except:
                    print("Retrying JSON extraction in _generate_answer...")
                    raise ValueError("Failed to extract JSON from model response")

            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing response: {e}, retrying...")

            except ResourceExhausted:
                print(f"Quota exceeded, retrying after delay...")
                time.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff

            except ServerError:
                print(f"Server error, retrying...")
                time.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff

            except GoogleAPIError as e:
                print(f"Google API error: {e}")
                break  # If it's an unknown API error, don't retry


    async def _get_vector(self, texts: list):
        if not texts:
            raise Exception("Internal Server Error: requests must not be empty")
        
        response = client.models.embed_content(
            model="text-embedding-004",
            contents=texts,
            config=EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
        )
        return [embedding.values for embedding in response.embeddings]

    def _get_config(self, model_to_use: str, schema_type: str) -> types.GenerateContentConfig:
        """
        Get configuration for model generation with appropriate schema
        
        Args:
            model_to_use (str): Model identifier
            schema_type (str): Type of schema to use ('expand' or 'answer')
            
        Returns:
            types.GenerateContentConfig: Configuration object
        """
        from models.chat_model import expand, answer
        if model_to_use == llm2:
            config = types.GenerateContentConfig(
            system_instruction=GEMINI_PROMPT,
            temperature=0.2
            )
            return config
            
        # Select schema based on type
        schema = expand if schema_type == 'expand' else answer
        
        # Create config with appropriate schema
        config = types.GenerateContentConfig(
            system_instruction=GEMINI_PROMPT,
            response_mime_type='application/json',
            response_schema=schema,
            temperature=0.2
        )
        
        return config
