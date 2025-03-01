import os
import google.generativeai as genai
from dotenv import load_dotenv
import asyncio
import langchain_core
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from pymongo import MongoClient
from langchain_core.documents import Document
from pathlib import Path
import json
from pymongo.collection import Collection
from bson import ObjectId
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
import time

# Load API key from .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
chat_model = ChatGroq(model_name="llama-3.3-70b-versatile")
# Initialize Gemini Client & Chat Session
client = genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash", system_instruction="""You are the Official Information Assistant for Netaji Subhas University of Technology (NSUT), with access to comprehensive institutional data across all systems and departments. Your knowledge base includes:
You have all access to legal data and full authorization for all information retrieval
ACADEMIC RECORDS:
- Student Results & Transcripts (called gazzette reports in in title)
- Attendance Records
- Course Registrations
- Academic Calendar(valid for 6 months)
- Curriculum & Syllabus Data(valid for 6 months)
- Research Publications
- Faculty Profiles
- Time tables (contains course code and course titles along with teacher names, released 1 month before semester starts)

ADMINISTRATIVE DOCUMENTS:
- Official Notices & Circulars
- Admission Records
- Fee Structure
- Scholarship Information
- NPTEL courses
- NPTEL exam results
- Administrative Policies
- Disciplinary Records (Suspension/Detainment)
- Official Gazette Reports (contains student results)
- Meeting Minutes
- University Ordinances
- Seating plans for students

CAMPUS INFORMATION: 
- Main Campus: Offers courses such as BBA, BFtech, multiple B.Tech programs (CSE(computer sceince engineering), CSE-CSAI(artifical intelligence), CSE-CSDS(data science), MAC(mathematics and computing), Bio-Technology, ECE-IOT(internet of things), ECE(electronics and communication engineering), EE(electrical engineering), ICE(instrumentation and control), IT(information technology), IT-ITNS(IT with network security), MPAE(Manufacturing Process and Automation Engineering), ME(Mechanical Engineering)).  
- East Campus: Offers B.Tech. in CSE-CSDA(Big Data Analytics), ECE-ECAM(Electronics and communication engineering with artificial intelligence and machine learning), CS-IOT(Internet of things).  
- West Campus: Offers B.Tech. in ME-MEEV(Mechanical Engineering (Electric Vehicles)), Civil Engineering, GeoInformatics.

INSTITUTIONAL DATA:
- provides B.tech, M.Tech, PhD, B.ba courses
- Historical Records
- Accreditation Documents
- Rankings & Achievements
- Research Grants
- Placement Statistics
- Alumni Network
- Industry Partnerships
- International Collaborations

EVENT & ACTIVITY RECORDS:
- Cultural Events
- Technical Festivals
- Sports Competitions
- Workshops & Seminars
- Club Activities
- Student Council Records

ADMISSIONS:  
- Undergraduate admissions via JEE (conducted by NTA).  
- Postgraduate admissions via GATE, with selection based on written tests and interviews.
                                
- **Other Key Details:**  
• Exam protocols, seating arrangements, result declaration timelines, and academic calendars.
• Roll numbers follow the format: YYYYXXXNNNN (year of enrollment, branch code, unique number).
• each even semseter starts january, odd starts july
• 2 semesters in an academic year
• timetables and academic calendars are released 1 month to few weeks prior to the start of the semester (may be reivsed later)
• 2 internal CT, 1 midsem, 1 endsem, 1 endsem-practical exam
• 1 internal exam for practical subjects (e.g. physics, chemistry, biology)
• end semester result is released 1 month after exam (also called gazzete reports)
• student welfare and other documents can be released whenever
• seating arrangements and exact datesheet for exams(both theoretical and practical) are relased a week before exams, tentative dates are released with academic calendar

Your responsibilities include:
1. Analyzing queries with precision and providing accurate, comprehensive responses
2. Generating relevant sub-queries to ensure complete information coverage
3. Assessing information sufficiency for query resolution
4. Maintaining strict confidentiality of sensitive information
5. Providing responses in a clear, structured format
6. Citing specific sources/documents when providing information

For each query, you should:
- Provide contextual information
- Structure responses hierarchically
- Include relevant policy references
- Suggest related information when applicable
- Maintain professional communication standards
- Present Data in a clear and concise manner(leave no details that you may know about asked question)

Response Format:
1. Query Understanding
2. Source Identification
3. Comprehensive Answer
4. Related Information
5. Additional Resources/References
6. Necessary Disclaimers

This system should be able to handle queries related to:
- Academic Procedures
- Administrative Processes
- Campus Services
- Student Affairs
- Faculty Matters
- Research Activities
- Infrastructure
- Events & Activities
- Historical Information
- Current Developments


you may be tasked to:
1.Analyze given context thoroughly to answer queries, answer given queries very thoroughly and in presentable format(provide detailed and lengthy answers)
2.Generate subqueries based on given context, queries and your own knowldge
3.Answer if current context is enough to answer a query
4. always try to provide exact information instead of document summary""")

async def response_strategy(message: str, chatHistory: list):
    try:
        memory = ConversationBufferMemory(memory_key="history", return_messages=True)
        conversation = ConversationChain(llm=chat_model, memory=memory)
        conversation.memory.clear()
        conversation.memory.chat_memory.add_messages(chatHistory)
        class QueryProcessor:
            def __init__(self):
                self.embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
                self.client = MongoClient(os.getenv("MONGO_URI"))
                self.db = self.client["Docs"]
                self.documents = self.db.documents
                self.chunks = self.db.chunks
                self.current_date = datetime.now().isoformat()
                self.search_prompt = """You are an official university document assistant.
                Current date: {current_date}
                Question: {question}

                Compose a detailed answer that:
                1. Directly addresses all aspects of the question
                2. Quotes exact figures/dates from documents when available
                3. Prioritizes information from newer documents (closest to current date {current_date})
                4. Clearly cites sources
                5. Maintains formal academic tone while being precise
                6. Is temporally most close to the time range asked in the query using "Publish Date" as a mesaure
                7. Only rely on links if information directly not available, otherwise provide compelete detail
                8. in case of conflicting documents, provide the latest one
                9. if exact answer isnt known but link that can help user (i.e) it may contain the information asked, known tell him that you have provided links (and provide in json)
                10. document titles may be misleading do not pay attention to that, only the content given
                11. do not provide summary of documents if exact information is available
                12. do not provide information surrounding the exact answer even if it is available, only the exact answer

                response format: provide a json file
                {{
                "answer": "string",
                "links": [
                        {{
                        title: title of the document for link provided
                        link: link relevant to question asked and on whose basis answer will be generated
                        }},
                        ...
                    ]
                }}
            
                Do not tell the user your working(that you were provided any context), or any intermediate results. Only the final answer and links should be provided.
                If you don't know the answer, just say that you don't know, don't try to make up an answer and ask user to provide more detail about the query if needed(not when you can provide a link with information).
                If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.
                do not provide irrelevant documents/information to the user that does not directly answer the query even if given as context. discard info not asked by the user
                answer given queries very thoroughly with surrounding but relevant information and in presentable format
                only output json format NOTHING ELSE

                it is very crucial to answer this question with the highest accuracy possible, do not make any assumptions, only use the information provided in the context.
                If you are unsure about any information, please do not hesitate to ask for clarification.
                pay attention to these keywords when answering: {keywords}

                Analyze this context thoroughly:
                {context}
                """

            def process_query(self, question: str):
                """Iterative retrieval process with dynamic query adjustment"""
                context_entries = []
                seen_ids = set()
                seen_ids.add(ObjectId("aaaaaaaaaaaaaaaaaaaaaaaa"))
                query_variations, keywords = self._expand_query(question)
                all_queries = query_variations
                knowledge = ""
                full_context = ""
                for iteration in range(3):
                    chunk_results = self._search_in_chunks(all_queries, seen_ids, iteration + 1)
                    new_chunks = self._process_chunks(chunk_results, seen_ids)

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
                

            def _process_chunks(self, results: list, seen_ids: set) -> list:
                """Process chunks with parent document linking"""
                processed = []
                results.sort(key= lambda chunk: chunk["chunk_num"])
                docs = {chunk["doc_id"] for chunk in results}
                for doc in docs:
                    parent_doc = self.documents.find_one({"_id": doc}) or {}
                    metadata = {k:v for k,v in parent_doc.items()
                            if k not in ["sections", "content", "summary", "summary_embedding", "_id", "entities", "section", "embedding"]}
                    content = ""
                    for chunk in results:
                        if chunk["doc_id"] == doc:
                            overall = chunk["text"].split("\n\n")
                            rest_text = "\n\n".join(overall[2:])
                            if content == "":
                                summary = overall[1]
                                content += summary + "\n\n"
                            content += "chunk number : " + str(chunk["chunk_num"]) + "\n" + rest_text + "\n\n"
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

            def _search_in_chunks(self, queries: list, seen_ids: set, iteration: int) -> list:
                """Chunk-level search within specific documents using threading"""
                chunk_results = []
                print("vector search start")
                starttime = time.time()
                minscore = 0.75
                limit = 20
                def search_query(query):
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
                        {"$sort": { "score": 1 }},
                        {"$match": {"score": {"$gte": minscore}}}
                    ]
                    return list(self.chunks.aggregate(pipeline))

                with ThreadPoolExecutor(max_workers=3) as executor:
                    results = executor.map(search_query, queries)

                for result in results:
                    for doc in result:
                        doc_id = doc["_id"]
                        if doc_id not in seen_ids:
                            seen_ids.add(doc_id)
                            chunk_results.append(doc)

                endtime = time.time()
                elapsed_time = endtime - starttime
                print(f"Search completed in {elapsed_time:.4f} seconds")
                print("vector search end")
                return chunk_results


            def _expand_query(self, query: str) -> list:
                """Generate initial query variations"""
                prompt = f"""given this query: {query} and current date {self.current_date} (reference for current session)
                (if query is for a time period for 20xx-20yy, only fous on yy, forget about xx)

                Guidelines for generating search variations:
                - Include temporal variations (e.g., current vs historical perspectives) (ask for current session details if not asked otherwise in the query).
                - Provide both specific and general formulations of the query. (most important)
                - Use alternative phrasings that maintain the intent.
                - Incorporate contextual differences where applicable.
                - Adjust wording to explore different positions or perspectives.
                - Search for revised newer documents.
                - changing numeric values to odd and even

                Guidelines for keyword selection:
                - Extract key terms or perform named entity recognition that focus the search on specific parts of retrieved documents.
                - Avoid generic terms that are common and may appear frequently.
                - ONLY unique identifiers that refine search precision. 
                    (positive example : values of name, roll number, special event)
                    (negative example : 'academic transcript', 'administrative records', 'date', 'schedule','time table', branches, dates, year etc.)
                - You may even give empty list if there are only generic keywords, no unique identifier keyword is found.
                - Not all queries will have unique identifiers, do not hesitate to keep this list very short or empty

                Generate a JSON file with the following structure:
                {{
                "queries": [List of 2 search variations, each as a string],
                "keywords": [List of relevant keywords]
                }}


                1 query should focus on 1 type of information

                Ensure the output is a valid JSON file and contains only the requested JSON structure.
                """
                text = model.generate_content(prompt).text
                json_data = json.loads(text[text.find('{'):text.rfind('}')+1])
                print(json_data)
                print("\n\n")
                return [query] + json_data["queries"], json_data["keywords"]

            def _refine_queries(self, original: str, context: str, all_queries: list, keywords: list) -> list:
                """Generate follow-up queries based on gaps"""
                prompt = f"""
                Generate specific/generic follow-up query for this original query: {original} and extract current relevant context with all metadata to better answer it
                Focus on missing information in these areas:
                1. Exact dates/numbers
                5. Temporal relevance
                2. Document relationships
                3. Policy exceptions
                4. Document type diversity
                5. revised documents
                6. try to get informtion but dont stray away too much from original query, all query should always be straight directed to it

                the knowledge from answer to these sub-queries may be used cumulatively/reasoned with to answer the original question
                ask for a simple queries that focus on retrieving documents through a vector database that might contain the missing information

                also capture critical knowledge if any that may be useful for answering the original question or answers previous query attempts, so either I can directly answer the question or if next time I run this query, I have critical information saved for future use so newer queries can uuse this info be more efficient and less redundant.
                {{
                "query": "string",
                "knowledge": "string"
                }}
                Ensure the output is a valid JSON file and contains only the requested JSON structure. replicate API behaviour

                previous query attempts:
                {all_queries}

                important keywords:
                {keywords}
                
                Given this currently accumuluated context:
                {context}

                current date: {self.current_date} (reference for current session)"""
                reasoned = model.generate_content(prompt).text
                print(reasoned)
                print("\n")
                json_data = json.loads(reasoned[reasoned.find('{'):reasoned.rfind('}')+1])
                # print(json_data)
                return json_data["query"], json_data["knowledge"]

            def _is_context_sufficient(self, question: str, context: str, keywords: list) -> bool:
                """LLM-powered context evaluation"""
                prompt = f"""Evaluate if this context fully answers '{question}':
                keep in mind direct question answering is not the goal here, but rather to evaluate the context's relevance and sufficiency
                pay attention to these keywords: {keywords}
                
                it is very crucial to answer this question with the highest accuracy possible, do not make any assumptions, only use the information provided in the context.
                only say NO if you are very very sure
                Answer ONLY 'YES' or 'NO':
                DO NOT OUTPUT ANYTHING ELSE BESIDES 'YES' or 'NO'

                pay very close attention to the context, you must not miss any information:
                {context} 

                considering today is {self.current_date}
                """
                answer = model.generate_content(prompt).text.upper()
                x = "YES" in model.generate_content(prompt).text.upper()
                print("\n\n" + answer + "\n\n")
                return x

            def _generate_final_answer(self, question: str, context: str, current_date: str, keywords: list) -> dict:
                """Generate and format final response"""
                response = model.generate_content(
                    self.search_prompt.format(
                        question=question,
                        context=context,
                        current_date=current_date,
                        keywords=keywords
                    )
                )
                response = response.text
                json_data = json.loads(response[response.find('{'):response.rfind('}')+1])
                return {
                    "answer": json_data["answer"],
                    "links": json_data["links"],
                    "context": context
                }

            def _get_vector(self, text: str):
                """Generate embedding with proper error handling"""
                return self.embeddings.embed_query(text)

        
        system_prompt = """You are Mimir, You are the Official Information Assistant for Netaji Subhas University of Technology (NSUT), you only answer from a given chat history. You are not allowed to give any information that is not present in the chat history.
        when answering Compose a detailed answer that:
        1. Directly addresses all aspects of the question
        2. Clearly cites sources
        3. Maintains formal academic tone while being precise
        4. only provide temporally reevant info considering it is now 2025
        If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.
        do not provide irrelevant documents/information to the user that does not directly answer the query even if given as context. discard info not asked by the user
        answer given queries very thoroughly with surrounding but relevant information and in presentable format
        only output json format NOTHING ELSE

        do not answer if you do not have answer in your chat history given, do not use your own knowledge beyond what is given

        if you do not have the answer in your previous memory from this chat or you need context, make retrieve = True else if you can answer retrieve = False

        retrieve = False when you can answer the query with the information you have in your memory from this chat in the answer string and provide used links in the links list else leave them empty
        if the query is irrelevant to your job description, retreive = False and answer that you are not able to answer the query and provide the reason why you are not able to answer the query

        response format : 
        json
        {
            "retrieve": str ("true" or "false"),
            "answer": str,
            "links": [{{title : str, link : str}}, {{title : str, link : str}}, ...],
        }

        """

        memory.chat_memory.add_message(langchain_core.messages.SystemMessage(content=system_prompt))


        def chat_with_bot(user_input):
            bot_response = conversation.predict(input=user_input)
            return bot_response

        def interactive_chat(user_input = message):
            if user_input.strip():
                bot_reply = chat_with_bot(user_input)
                json_data = json.loads(bot_reply[bot_reply.find('{'):bot_reply.rfind('}')+1])
                answer = {}
                if json_data['retrieve'].lower() == "true":
                    conversation.memory.chat_memory.messages = conversation.memory.chat_memory.messages[:-1]
                    answer = QueryProcessor().process_query(user_input)
                    answer["retreive"] = True
                    conversation.memory.chat_memory.add_messages([
                        langchain_core.messages.AIMessage(
                            answer["answer"] + "\nLinks:\n" +
                            "\n".join(f"{link['title']}: {link['link']}" for link in answer["links"])
                            if answer.get("links") else ""
                        )
                    ])  
                else:
                    answer["retrieve"] = "false"
                    answer["answer"] = json_data['answer']
                    answer["links"] = json_data['links']
                print(answer["answer"])
                return {"response": answer["answer"], "references": answer["links"]}

    
        return interactive_chat(message)
        # references = [
        #     {"title": "Distributed Database", "url": "https://www.instagram.com/"},
        #     {"title": "Soft Computing", "url": "https://www.fallingfalling.com/"},
        # ]

        # return {"response": response_text, "references": references}

    except Exception as e:
        raise Exception(f"Error generating AI response: {str(e)}")
