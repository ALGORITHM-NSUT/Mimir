import logging
from bson import ObjectId
from datetime import datetime
from constants.Gemini_search_prompt import Gemini_search_prompt
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
from utils.redis_client import redis_client
from models.chat_model import expand, answer

class QueryProcessorError(Exception):
    """Base exception for QueryProcessor errors"""
    def __init__(self, message: str, original_error: Exception = None):
        super().__init__(message)
        self.original_error = original_error

class ModelAPIError(QueryProcessorError):
    """Errors related to model API calls"""
    pass

class DatabaseError(QueryProcessorError):
    """Errors related to database operations"""
    pass

class rerankerError(QueryProcessorError):
    """Errors related to reranker operations"""
    pass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='application.log',  # Logs will be saved to this file
    filemode='a'  # Append to the file instead of overwriting
)

max_keys = 3
def get_next_index() -> int:
    # Get current index
    try:
        if redis_client.get("index") is None:
            redis_client.set("index", 0)
            return 0
        index = int(redis_client.get("index"))
        # Increment index (loop back to 0 after 19)
        next_index = (index + 1) % max_keys
        redis_client.set("index", next_index)
        logging.info(f"Next index set to: {next_index}")
        return index
    except Exception as e:
        logging.error(f"Error getting next index {e}, defaulting to 0")
        return 0
    

load_dotenv()
index = get_next_index()
MONGO_URI_MIMIIR = os.getenv("MONGO_URI_MIMIR")

mongoDb_client = AsyncIOMotorClient(MONGO_URI_MIMIIR)


# Thinking Model

llm2 = "gemini-2.5-flash-preview-04-17"
# Action Model for quick search
llm = "gemini-2.5-flash-preview-04-17"


MAX_RETRIES = 3

class QueryProcessor:
    def __init__(self):
        self.client = mongoDb_client
        self.db = self.client["Docs"]
        self.documents = self.db.documents
        self.chunks = self.db.chunks
        self.current_date = datetime.now().date().isoformat()
        self.search_prompt = Gemini_search_prompt
        logging.info("QueryProcessor initialized")

    async def process_query(self, question: str, plan: list, document_level: bool, is_deep_search: bool = False):
        """Iterative retrieval process with dynamic query adjustment"""
        try:
            # Select model based on deep search flag
            
            model_to_use = llm2 if is_deep_search else llm
            
            logging.info(f"Model to use: {model_to_use}")
            
            
            context_entries = []
            seen_ids = set()
            knowledge = ""
            max_iter = 3
            ans = {}
            step = 1
            queries = plan[step - 1]["specific_queries"]
            if not document_level:
                for iteration in range(max_iter):
                    docs = []
                    doc_ids = []
                    # if docs:
                    #     doc_ids = [doc["_id"] for doc in docs]
                    # else:
                    #     doc_ids = []
                    chunk_results, current_docids, seen_ids = await self._search_in_chunks(queries, seen_ids, doc_ids, iteration + 1)
                    iteration_context = self._format_context(chunk_results)
                    context_entries.append(iteration_context)
                    ans = await self._generate_answer(
                        question, 
                        iteration_context, 
                        self.current_date, 
                        plan, 
                        knowledge, 
                        max_iter, 
                        iteration + 1, 
                        step, 
                        model_to_use,
                        document_level,
                        queries
                    )  
                    
                    if "final_answer" in ans and ans["final_answer"]:
                        ans["answer"] = self.fix_markdown_tables(ans["answer"])
                        return ans
                    if iteration == max_iter - 1:
                        return ans
                    if "answer" in ans and ans["answer"] is not None:
                        knowledge += str(ans["answer"]) + "\n"
                    if "links" in ans and len(ans["links"]) != 0:
                        knowledge = knowledge + " " + json.dumps(ans["links"], indent=2) + "\n\n"
                    
                    step = ans["step"]
                    queries = ans["specific_queries"]
            else:
                docs = await self._search_docs(question, document_level)
                context = self._format_context(docs)
                max_iter = 1
                step = 1
                ans = await self._generate_answer(
                    question, 
                    context, 
                    self.current_date, 
                    plan, 
                    knowledge, 
                    max_iter, 
                    1, 
                    step, 
                    model_to_use,
                    document_level,
                    queries
                )
            return ans 
         
        except ModelAPIError as e:
            logging.error(f"Model API error in process_query: {str(e)}", exc_info=True)
            raise
        except DatabaseError as e:
            logging.error(f"Database error in process_query: {str(e)}", exc_info=True)
            raise
        except rerankerError as e:
            logging.error(f"Rerank error in process_query: {str(e)}", exc_info=True)
            raise
        except Exception as e:
            logging.error(f"Unexpected error in process_query: {str(e)}", exc_info=True)
            raise QueryProcessorError(f"Query processing failed: {str(e)}", e)
        
    def fix_markdown_tables(self, text: str) -> str:
        """Fix markdown tables in the text"""
        lines = text.splitlines()
        out = []
        i = 0
        header_re = re.compile(r"^\s*\|.*\|\s*$")
        sep_re = re.compile(r"^\s*\|(?:[ \-]*\|)+\s*$")
        while i < len(lines):
            if header_re.match(lines[i]) and i+1 < len(lines) and sep_re.match(lines[i+1]):
                cols = [c for c in lines[i].strip().strip('|').split('|')]
                n = len(cols)
                out.append(lines[i])
                out.append('|' + '|'.join(['---']*n) + '|')
                i += 2
                while i < len(lines) and lines[i].strip().startswith("|"):
                    out.append(lines[i])
                    i += 1
            else:
                out.append(lines[i])
                i += 1
        return "\n".join(out)

    def _process_chunks(self, docs: set, all_results: list) -> list:
        doc_metadata_map = {}
        
        for doc_id in docs:
            content = []
            metadata = {}
            pages_added = set()
            page_summaries = []
            
            matching_chunks = [chunk for chunk in all_results if str(chunk["doc_id"]) == doc_id]
            if not matching_chunks:
                continue
                
            # Initialize metadata from first chunk
            first_chunk = matching_chunks[0]
            metadata = first_chunk["doc_info"][0]
            metadata["Publish Date"] = metadata["Publish Date"].date().isoformat()
            metadata["summary"] = metadata.get("summary", "")
            page_summaries = metadata.pop("page_summaries", [])
            
            # Process each chunk
            for chunk in matching_chunks:
                page = chunk["page"]
                
                # Add page summary if not already added
                if page not in pages_added and (page - 1) < len(page_summaries):
                    content.append(f"page : {page}")
                    content.append(f"summary for page : {page_summaries[page - 1]}\n")
                    pages_added.add(page)
                
                # Add chunk content
                content.append(f"chunk number: {chunk['chunk_num']}")
                content.append(chunk['text'])
                
                if chunk.get("table_summary"):
                    content.append(f"table summary: {chunk['table_summary']}")
                content.append("")  # Empty line between chunks
            
            if content:
                metadata["content"] = "\n".join(content)
                doc_metadata_map[doc_id] = metadata

        return sorted(
            doc_metadata_map.values(),
            key=lambda x: x["Publish Date"],
            reverse=True
        )


    def _format_context(self, items: list) -> str:
        """Structure context for LLM comprehension"""
        context = "Document Chunks: \n\n"
        for doc in items:
            meta = json.dumps(doc, indent=2)
            context += f"{meta}\n\n"
        return context
    
    async def _doc_query(self, doc_query_vector, limit: int, query: str) -> list:
        minscore = 0.75
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
            {"$addFields": {"vs_score": {"$meta": "vectorSearchScore"}}},
            {"$sort": { "vs_score": -1 }},
            {"$match": {"vs_score": {"$gte": minscore}}},
            {
                "$project": {
                    "summary": 1,
                    "Publish Date": 1,
                    "Title": 1,
                    "Published By": 1,
                    "Publishing Post": 1,
                    "Publishing Department": 1,
                    "Link": 1
                }
            }
        ]
        for attempt in range(MAX_RETRIES):  # Retry up to 5 times
            try:
                
                result = self.documents.aggregate(pipeline)
                docs = [{"Title": doc["Title"], "summary" : doc["summary"], "Publish Date": doc["Publish Date"].date().isoformat(), "Published By": doc["Published By"], "Publishing Department": doc["Publishing Department"], "Link": doc["Link"]} async for doc in result]
                return docs
                    
            except OperationFailure as e:
                logging.warning(f"MongoDB OperationFailure: {e}, retrying...")
                if attempt == MAX_RETRIES - 1:
                    raise DatabaseError(f"MongoDB search failed after {MAX_RETRIES} retries: {str(e)}")
                await asyncio.sleep(2 ** attempt + random.uniform(0, 1))
            
            except asyncio.TimeoutError:
                logging.warning(f"MongoDB Timeout, retrying attempt {attempt+1}...")
                if attempt == MAX_RETRIES - 1:
                    raise DatabaseError(f"MongoDB search failed after {MAX_RETRIES} retries: {str(e)}")
                await asyncio.sleep(2 ** attempt + random.uniform(0, 1))

        
    async def _search_docs(self, query: str, document_level: bool = False) -> list:
        """Search documents based on query string"""
        try:
            limit = 50
            queryembeds = await self._get_vector([query])
            return await self._doc_query(queryembeds[0], limit, query)
            
        except Exception as e:
            logging.error(f"Error in _search_docs: {str(e)}")
            raise DatabaseError(f"Error in _search_docs, document searching failed: {str(e)}")

    async def _search_query(self, query_vector, seen_ids: set, minscore: float, vector_weight: float, full_text_weight: float, limit: int, doc_ids: list, query: str) -> list:
        """Search query with MongoDB quota handling"""
        keyword = query[query.find('"') + 1:query.rfind('"')]
        query = query.replace('"', '')
        pipeline = [
            {
                "$vectorSearch": {
                    "queryVector": query_vector,
                    "path": "embedding",
                    "numCandidates": 5000,
                    "limit": 25,
                    "index": "vector_index"
                }
            },
            {"$addFields": {"vector_score": {"$meta": "vectorSearchScore"}}},
            {"$sort": {"vector_score": -1}},
            {"$match": {"vector_score": {"$gte": minscore}}},
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
                            }
                        },
                        {
                            "$addFields": {
                                "fts_score_meta": { "$meta": "searchScore" }
                            }
                        },
                        {
                            "$sort": {
                                "fts_score_meta": -1
                            }
                        },
                        {
                            "$limit": 25
                        },   
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
                "$lookup": {
                    "from": "documents",
                    "localField": "doc_id",
                    "foreignField": "_id",
                    "as": "doc_info"
                }
            },
            {
                "$project": {
                    "vs_score": {"$ifNull": ["$vs_score", 0]},
                    "fts_score": {"$ifNull": ["$fts_score", 0]},
                    "_id": 1,
                    "doc_id": 1,
                    "chunk_id": 1,
                    "text": 1,
                    "page": 1,
                    "chunk_num": 1,
                    "table_summary": 1,
                    "doc_info.Publish Date": 1,
                    "doc_info.Published By": 1,
                    "doc_info.Title": 1,
                    "doc_info.summary": 1,
                    "doc_info.Publishing Post": 1,
                    "doc_info.Publishing Department": 1,
                    "doc_info.Link": 1,
                    "doc_info.page_summaries": 1,
                    "doc_info.Pages": 1
                }
            },
            {"$sort": {"score": -1}},
            {"$limit": limit}
        ]
        preferred_doc_boost = 1.25 
        # if doc_ids:
        #     pipeline[11]["$project"]["score"] = {
        #         "$multiply": [
        #             {
        #                 "$add": [
        #                     {"$ifNull": ["$vs_score", 0]},
        #                     {"$ifNull": ["$fts_score", 0]}
        #                 ]
        #             },
        #             {
        #                 "$cond": {
        #                     "if": {"$in": ["$doc_id", doc_ids]},
        #                     "then": preferred_doc_boost,
        #                     "else": 1.0
        #                 }
        #             }
        #         ]
        #     }
        # else:
            # Original score calculation if no doc_ids provided
        pipeline[11]["$project"]["score"] = {
            "$add": [
                {"$ifNull": ["$vs_score", 0]},
                {"$ifNull": ["$fts_score", 0]}
            ]
        }
        if keyword:
            pipeline[8]["$unionWith"]["pipeline"][0]["$search"]["compound"] = {
                "must": [
                    {
                        "phrase": {
                            "query": keyword,
                            "path": ["text"]
                        }
                    }
                ],
                "should": [
                    {
                        "text": {
                            "query": query,
                            "path": ["text", "table_summary"]
                        }
                    }
                ]
            }
        else:
            pipeline[8]["$unionWith"]["pipeline"][0]["$search"]["text"] = {"query": query, "path": ["text", "table_summary"]}
        
        #pipeline[0]["$vectorSearch"]["filter"] = {"_id": {"$nin": list(seen_ids)}}
        for attempt in range(MAX_RETRIES):  # Retry up to 5 times
            try:
                cursor = self.chunks.aggregate(pipeline)
                return [doc async for doc in cursor]
                # return await self._rerank(docs, query, ["text", "table_summary"])
            
            except OperationFailure as e:
                if attempt == MAX_RETRIES - 1:
                    raise DatabaseError(f"MongoDB search failed after {MAX_RETRIES} retries: {str(e)}")
                await asyncio.sleep(2 ** attempt + random.uniform(0, 1))
            
            except asyncio.TimeoutError as e:
                logging.error(f"MongoDB Timeout: {e}, attempt {attempt + 1}/{MAX_RETRIES}")
                if attempt == MAX_RETRIES - 1:
                    raise DatabaseError(f"MongoDB timeout after {MAX_RETRIES} retries")
                await asyncio.sleep(2 ** attempt + random.uniform(0, 1))
            
            except Exception as e:
                logging.error(f"Unexpected error in search_query: {str(e)}")
                raise QueryProcessorError(f"Unexpected error during search: {str(e)}")

    async def _search_in_chunks(self, queries: list, seen_ids: set, doc_ids: list, iteration: int) -> list:
        minscore = 0.75
        maxdocs = 20
        async def search_query(query):
            limit = int(max(10, query["expansivity"] * maxdocs))
            vector_weight = min(0.6, max(0.4, 1 - query["specificity"]))
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

        for i in range(len(queries)):
            queries[i].pop("embedding")
            
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
        for attempt in range(MAX_RETRIES):
            JINA_API_KEY = os.getenv("JINA_API_KEY").split(" | ")[(index + attempt) % max_keys].strip()
            url = 'https://api.jina.ai/v1/rerank'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + JINA_API_KEY
            }
            searchspace = ["\n".join(doc[field] for field in fields if field in doc and doc[field] is not None) for doc in docs]
            data = {
                "model": "jina-colbert-v2",
                "query": question,
                "documents": searchspace
            }
            try:
                response = requests.post(url, headers=headers, json=data)
                
                return [docs[result["index"]] for result in response.json()["results"] if result["relevance_score"] > 0.5]
            except json.JSONDecodeError as e:
                logging.error("Reranking failed, quota limit exceeded for index: " + str(index) + " " + str(e))
                if attempt == MAX_RETRIES - 1:
                    raise rerankerError(f"Reranking failed after {MAX_RETRIES} attempts: {str(e)}")
            except Exception as e:
                logging.error("Reranking failed, unexpected error for index: " + str(index) + " " + str(e))
                if attempt == MAX_RETRIES - 1:
                    raise rerankerError(f"Reranking failed after {MAX_RETRIES} attempts: {str(e)}")
            await asyncio.sleep(2 ** attempt + random.uniform(0, 1))
    
    async def _generate_answer(self, question: str, context: str, current_date: str, plan: list, knowledge: str, max_iter: int, iteration: int, step: int, model_to_use: str = llm, document_level: bool = False, specific_queries: list = None) -> dict:
        """Generate and format final response"""
        full_plan = {}
        if document_level:
            full_plan = {"original user question for correct document identification": question, "plan": plan}
            specific_queries = ["This is a document level query, using given summaries, give brief about sources that may be used as a source to answer the question, the user does nt require exact answer, but a brief about the relevant sources"]
        else:
            full_plan = {"original user question": question, "plan": plan}
            
        warning = ""
        if model_to_use == llm2:
            warning = "if final response is too long to fit in the output window, give as much as possible then truncate some of it and give relevant documents, but the json format shouldn't be broken."
        
        for attempt in range(MAX_RETRIES):
            try:
                llmcontext = self.search_prompt.substitute(
                        warning=warning,
                        step=step,
                        question=question,
                        context=context,
                        current_date=current_date,
                        action_plan=full_plan,
                        specific_queries=specific_queries,
                        knowledge=knowledge,
                        max_iter=max_iter,
                        iteration=iteration,
                        max_steps=len(plan))
                logging.info(f"LLM context: {llmcontext}")
                GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY").split(" | ")[(index + attempt) % 2].strip()
                client = genai.Client(api_key=GEMINI_API_KEY)
                response = client.models.generate_content(
                    model=model_to_use,
                    contents=[llmcontext],
                    config=self._get_config(model_to_use, 'answer')
                ).text
                
                match = re.search(r'\{.*\}', response, re.DOTALL)  # Extract JSON safely
                if not match:
                    raise ValueError("Failed to extract JSON from model response")
                else:
                    try:
                        json_data = json.loads(match.group(0), strict = False)
                        return json_data
                    except:
                        raise ValueError("Failed to extract JSON from model response")

                
            except (json.JSONDecodeError, ValueError) as e:
                logging.warning(f"Error parsing response: {e}, retrying...")
                if attempt == MAX_RETRIES - 1:
                    raise ValueError(f"Failed to extract JSON from model response after {MAX_RETRIES} retries: {str(e)}")

            except ResourceExhausted as e:
                logging.warning(f"Quota exceeded, retrying after delay...")
                if attempt == MAX_RETRIES - 1:
                    raise ModelAPIError(f"Resource exhausted response after {MAX_RETRIES} retries: {str(e)}")
                # Exponential backoff
                await asyncio.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff

            except ServerError as e:
                logging.warning(f"Server error, retrying...")
                if attempt == MAX_RETRIES - 1:
                    raise ModelAPIError(f"API server error response after {MAX_RETRIES} retries: {str(e)}")
                # Exponential backoff
                await asyncio.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff

            except GoogleAPIError as e:
                logging.error(f"Google API error: {e}")
                raise ModelAPIError(f"API server error response after {MAX_RETRIES} retries: {str(e)}")
                


    async def _get_vector(self, texts: list):
        if not texts:
            logging.error("Empty texts list provided for embedding")
            raise Exception("Internal Server Error: requests must not be empty")
        for attempt in range(MAX_RETRIES):
            try:
                GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY").split(" | ")[(index + attempt) % 2].strip()
                client = genai.Client(api_key=GEMINI_API_KEY)
                response = client.models.embed_content(
                        model="text-embedding-004",
                        contents=texts,
                        config=EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
                    )
                return [embedding.values for embedding in response.embeddings]
            except ResourceExhausted:
                logging.warning(f"Quota exceeded, retrying after delay...")
                if attempt == MAX_RETRIES - 1:
                    raise ModelAPIError(f"Resource exhausted response after {MAX_RETRIES} retries")
                await asyncio.sleep(2 ** attempt + random.uniform(0, 1))
            except ServerError:
                logging.warning(f"Server error, retrying...")
                if attempt == MAX_RETRIES - 1:
                    raise ModelAPIError(f"API server error response after {MAX_RETRIES} retries")
                await asyncio.sleep(2 ** attempt + random.uniform(0, 1))
            except Exception as e:
                logging.error(f"Google API error: {e}")
                raise ModelAPIError("Unexpected error occurred while generating embeddings")
                
        # If all attempts fail, raise an exception

    def _get_config(self, model_to_use: str, schema_type: str) -> types.GenerateContentConfig:
        """Generate configuration for the model"""
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
