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
                query_variations, keywords, specifity = await self._expand_query(question)
                all_queries = [question] + query_variations
                new_queries = all_queries
                knowledge = ""
                max_iter = 5
                ans = {}
                for iteration in range(max_iter):
                    chunk_results, current_ids = await self._search_in_chunks(new_queries, seen_ids, iteration + 1, question, specifity)

                    iteration_context = self._format_context(chunk_results, current_ids)
                    context_entries.append(iteration_context)

                    # full_context += iteration_context + "\n\n"
                    ans = await self._generate_answer(question, iteration_context, self.current_date, keywords, all_queries, knowledge, max_iter - 1, iteration)  
                    if ans["answerable"]:
                        print(f"Stopping early at iteration {iteration+1}")
                        return ans
                    else:
                        print(ans)
                    if iteration == max_iter - 1:
                        print(f"could not find ans, returning relevant info")
                        return ans
                    all_queries += ans["queries"]
                    new_queries = ans["queries"]
                    knowledge = ans["knowledge"]
                return ans  
                

            def _process_chunks(self, docs: set, all_results: list, chunk_query_mapping: dict) -> list:
                processed = []
                for doc in docs:
                    metadata = {}
                    content = []
                    curr_chunk = -6
                    for chunk in all_results:
                        if str(chunk["doc_id"]) == doc:
                            overall = chunk["text"].split("\n\n")
                            rest_text = "\n\n".join(overall[2:])
                            summary = overall[1]
                            if metadata == {}:
                                metadata = chunk["doc_info"][0]
                                metadata["_id"] = str(metadata["_id"])
                                metadata["Publish Date"] = metadata["Publish Date"].date().isoformat()
                            if chunk["chunk_num"] <= (curr_chunk + 5):
                                content[-1][0] += rest_text
                            else:
                                content.append(["chunk number : " + str(chunk["chunk_num"]) + "\npage number: " + str(chunk["page"]) + "\n\n" + summary + "\n\n" + rest_text + "\n\n", chunk_query_mapping[chunk["_id"]]])
                            curr_chunk = chunk["chunk_num"]
                    processed.append([content, metadata])
                format = {}
                for tuple in processed:
                    metadata = tuple[1]
                    for pair in tuple[0]:
                        metadata["content"] = pair[0]
                        if pair[1] not in format:
                            format[pair[1]] = []
                        format[pair[1]].append(metadata)
                return format


            def _format_context(self, items: list, docs: set) -> str:
                """Structure context for LLM comprehension"""
                context = "Document Chunks: \n\n"
                final_docs  = []
                items.sort(key= lambda doc: int(re.search(r'\d+', doc["content"].split("\n")[0]).group(0)))
                for doc in docs:
                    metadata = {}
                    prev_content = ""
                    for item in items:
                        if str(item["_id"]) == doc:
                            overall = item["content"].split("\n\n")
                            rest_text = "\n\n".join(overall[2:])
                            if metadata == {}:
                                metadata = item
                            elif prev_content != rest_text:
                                metadata["content"] += "\n\n" + rest_text + "\n\n"
                            prev_content = rest_text
                    if metadata != {}:
                        final_docs.append(metadata)

                for doc in final_docs:
                    del doc["_id"]
                    meta = json.dumps(doc, indent=2)
                    context += f"{meta}\n\n"
                return context

            async def _search_query(self, query: str, seen_ids: set, minscore: float, vector_weight: float, full_text_weight: float, limit: int):
                """Search query with MongoDB quota handling"""
                query_vector = self._get_vector(query)
                pipeline = [
                    {
                        "$vectorSearch": {
                            "queryVector": query_vector,
                            "path": "embedding",
                            "filter": {"_id": {"$nin": list(seen_ids)}},
                            "numCandidates": 1000,
                            "limit": limit,
                            "index": "vector_index"
                        }
                    },
                    {"$addFields": {"vs_score": {"$meta": "vectorSearchScore"}}},
                    {"$sort": { "vs_score": 1 }},
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
                            "chunk_num": "$docs.chunk_num"
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
                                            
                                            "must": [{
                                                "text": {
                                                        "query": query,
                                                        "path": "text"
                                                    },                                            
                                            }],
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
                                        "chunk_num": "$docs.chunk_num"
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
                            "chunk_num": {"$first": "$chunk_num"}
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
                            "chunk_num": 1
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
                            "doc_info.summary": 0,
                            "doc_info.content": 0,
                            "doc_info.summary_embedding": 0,
                            "doc_info.sections": 0,
                            "doc_info.entities": 0,
                            "doc_info.doc_id": 0,
                        }
                    },
                    {"$sort": {"score": -1}},
                    {"$limit": limit}
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

            async def _search_in_chunks(self, queries: list, seen_ids: set, iteration: int, og_question: str, specifity: float) -> list:
                chunk_results = []
                minscore = 0.75
                limit = 20
                vector_weight = min(0.7, max(0.3, 1 - specifity))
                full_text_weight = 1 - vector_weight
                query_results = {}

                async def search_query(query):
                    return await self._search_query(query, seen_ids, minscore, vector_weight, full_text_weight, limit)
                    
                tasks = {query: asyncio.create_task(search_query(query)) for query in queries}
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
                formatted = self._process_chunks(docs, all_results, chunk_query_mapping)
                reranked = self._rerank(formatted, og_question)
                return reranked, docs
            
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
                #     top_n=25
                # )

                # for result in response.results:
                #     reranked.append(trial[result.index])
                return trial
            
            async def _expand_query(self, query: str) -> list:
                """Generate initial query variations with API quota handling"""
                prompt = Query_expansion_prompt.format(query=query, current_date=self.current_date)

                for attempt in range(5):  # Retry up to 5 times
                    try:
                        text = model.generate_content(prompt).text
                        match = re.search(r'\{.*\}', text, re.DOTALL)
                        if not match:
                            raise ValueError("Failed to extract JSON from model response")
                        json_data = json.loads(match.group(0))
                        return [query] + json_data.get("queries", []), json_data.get("keywords", []), json_data.get("specifity", 0.5)
                    
                    except (json.JSONDecodeError, ValueError) as e:
                        print(f"Error parsing response: {e}, retrying...")

                    except ResourceExhausted:
                        print(f"Quota exceeded, retrying after delay...")
                        time.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff

                    except GoogleAPIError as e:
                        print(f"Google API error: {e}")
                        break  # If it's an unknown API error, don't retry

                raise Exception("Failed after multiple retries due to API quota limits.")

            async def _generate_answer(self, question: str, context: str, current_date: str, keywords: list, knowledge: str, all_queries: list, max_iter: int, iteration: int) -> dict:
                """Generate and format final response"""
                response = model.generate_content(
                    self.search_prompt.format(question=question,
                        context=context,
                        current_date=current_date,
                        keywords=keywords,
                        knowledge=knowledge,
                        all_queries=all_queries,
                        max_iter=max_iter,
                        iteration=iteration)
                    ).text
                
                match = re.search(r'\{.*\}', response, re.DOTALL)  # Extract JSON safely
                if not match:
                    raise ValueError("Failed to extract JSON from model response")
                
                json_data = json.loads(match.group(0))
                return json_data


            def _get_vector(self, text: str):
                """Generate embedding with proper error handling"""
                return self.embeddings.embed_query(text)