Query_expansion_prompt = """Given the following query: "{query}" and the current date "{current_date}" (for reference in this session), your task is to create an **action plan** to retrieve information step by step, based on your system knowledge of where different types of data are stored.  

🚨 **STRICT RULES TO FOLLOW:**  
1️⃣ **Break down the query into logical steps.**  
2️⃣ **Each step consists of at least one specific query (no maximum limit).**  
3️⃣ **For "AND" queries (multiple pieces of information needed), create multiple specific queries per step.**  
4️⃣ **Determine if specific queries can be resolved using document-level searches or require direct retrieval.**  
5️⃣ **An action plan can have a minimum of 1 step and a maximum of 4 steps.**  
6️⃣ **If required, use previously known user knowledge to refine queries.**  
7.  **Before making queries, think very carefully about the timeline, what date is today, what date is the query asking for, and what date documents are typically released to determine accurately what documents you would have in the database and reason correctly.**
8. **If user mentions past, think how much documents would have been released after it**
---

## **📌 Action Plan Structure**
- **Each step must have at least one "specific query."**  
- **Document-level queries may be 0 or more per step.**  
- **Each specific query must have a specificity score (`0.0 - 1.0`) and extracted keywords.**  
- **Ensure the action plan is structured for efficient retrieval.**
- **DO NOT include a step that does not require more data retreival, if a step can be resolved with the information already known, it should be removed.**
- **May create (optional step) if the data retreived may not be confirmed to follow the action plan assumptions**.
- **If no specific year given , use the current year as a default. unless according to docuemnt release timelines from system information, that document wouldnt have been released**
---

## **📌 Guidelines for Query Expansion**
- Generate **specific queries** to retrieve data step-by-step.  
- **Split** queries that ask for more than one data into sub-queries, dont make queries that ask for multiple data in 1 query, use of comma or and is not allowed unless it is used a filter for logical and for a single query.
- **Ensure meaningful variation**:
  - Queries should be **precise and retrieval-ready** (e.g., add batch, semester, department, roll number if available).  
  - **Modify numeric values logically** (e.g., even ↔ odd semester if applicable).  
  - If timeframe is missing, **infer a reasonable session** (but never predict future years).  
- **Use both full form and abbreviation** if relevant.  
- **Maintain original query intent**—no unnecessary generalization. 
- **Document queries should not be too generic, they chould still contain semester, timeframe(if given), department, etc if available.**
- **whenever asking for roll number check for result of PREVIOUS semester for only specific branch given, unless asked data is of previous year then search for current result**
---

## **📌 Guidelines for Specificity Score (`specificity`)**
- Assign a **float value between `0.0` and `1.0`** to indicate how specific the original query is.  
- **Use the following reference scale:**  
  - **`1.0` → Very specific** (e.g., `"What was student X's SGPA in 5th semester?"`)  
  - **`0.5` → Moderately specific** (e.g., `"Tell me everything about professor X who taught CSE in 2024?"`)  
  - **`0.0` → Very broad** (e.g., `"Tell me about placements at NSUT?"`)  
- **The specificity score applies to each specific query** inside the action plan.  

## **📌 Guidelines for Expansive score (`expansivity`)**
- Assign a **float value between `0.0` and `1.0`** to indicate how large the answer of the query can be expected to be.
- **Use the following reference scale:**
- **`1.0` → Very large** (e.g., `"Give me the academic calendar"`)
- **`0.5` → Moderately large** (e.g., `"Tell me about all the professors in CSE department?"`)
- **`0.0` → Very small** (e.g., `"Tell me about the student X's roll number?"`)
---

### ** Guidelines for Keyword Extraction**
- Identify **unique identifiers** to enhance retrieval precision.
- Only extract keywords that are **critical for retrieving relevant results**.
  - **Positive examples:** values of: "roll number", "event name", "academic year", "2nd semester".
  - **Negative examples:** Generic terms like "NSUT", "students", "policy", "semester".
- **If no specific keywords are found, return an empty list**.

---

## **📌 JSON Output Format (STRICT)**
```json
{{
    "action_plan": [
        {{
            "step": 1,
            "reason": "Explain why this step is needed",
            "specific_queries": [
                {{
                    "query": "Specific Query 1",
                    "specificity": float,
                    "expansivity": float
                    "keywords": ["keyword1", "keyword2"]
                }}
            ],
            "document_queries": [
                "Document-Level Query 1",
                "Document-Level Query 2"
            ]
        }}
    ]
}}

📌 Rules:
**At least one "specific query" per step each should be very unqiue do not make more than required but no max limit, without specific queries NO DATA will be returned.**
"Document queries" can be 0 or more per step.
Each "specific query" must have specificity and extracted keywords.
If multiple peices of information do not depend upon each other, they can be inquired in one step. different document queries can be inquired in the same step.
Only generate multiple steps if answer of 1 step will be used to get enough data for next step
Document_queries list can contain more tha 1 type of unrelated documents, try your best to reduce steps while increasing subqueries
try to make a step to get full forms of ambiguos data.
if data gathering by document query is ambiguos and may or may not depend upon previous data, you may create an (optional step) for it and mention it in the reason.
Ensure JSON is well-formed.

📌 Example 1: Query for Occasion-Based Holiday
🔍 Query: "Is there a holiday on Diwali in NSUT?"
✅ Generated Action Plan:
{{
    "action_plan": [
        {{
            "step": 1,
            "reason": "Search the academic calendar to check official holidays for this session.",
            "specific_queries": [
                {{
                    "query": "NSUT Academic Calendar 2025 official holidays",
                    "specificity": 0.6,
                    "expansivity": 0.9,
                    "keywords": ["academic calendar", "holiday", "2025"]
                }}
            ],
            "document_queries": [
                "Academic Calendar for 2025"
            ]
        }},
        {{
            "step": 2,
            "reason": "Verify if Diwali specifically is listed as a holiday using event-specific documents.",
            "specific_queries": [
                {{
                    "query": "Diwali holiday notification from NSUT administration 2025",
                    "specificity": 0.6,
                    "expansivity": 0.5,
                    "keywords": ["Diwali", "holiday", "2025"]
                }}
            ],
            "document_queries": [
                "Official Notices & Circulars for 2025",
                "Administrative Policies 2025"
            ]
        }}
    ]
}}
📌 Reasoning Explanation:
Step 1: First, search the Academic Calendar for all listed holidays.
Step 2: If Diwali isn't explicitly listed, verify with notices or circulars.

📌 Example 2: Query for Seating Arrangement of a Student
🔍 Query: "Where is my seating arrangement for the end semester exam for 4th semester in B branch?"

✅ Generated Action Plan:
{{
    "action_plan": [
        {{
            "step": 1,
            "reason": "Retrieve the roll number of the student X using their previous semester result because the user hasnt mentioned past so they must mean they are currently in the specified semester so current semester has not ended and result will not available to retreive",
            "specific_queries": [
                {{
                    "query": "end semester result of student X in branch B, 3rd semster",
                    "specificity": 0.8,
                    "expansivity": 0.3,
                    "keywords": ["X", "B", "result", "3rd semester"]
                }}
            ],
            "document_queries": [
                "Official Gazette Report for 3rd semester branch B"
            ]
        }},
        {{
            "step": 2,
            "reason": "Use the roll number to find the seating arrangement for the upcoming end-semester exam.",
            "specific_queries": [
                {{
                    "query": "Seating arrangement for roll number X in end-semester exam 2025",
                    "specificity": 0.9,
                    "expansivity": 0.5,
                    "keywords": ["seating arrangement", "endsem", "X", "2025"]
                }}
            ],
            "document_queries": [
                "Seating Plan for End Semester Exam for A semester for branch B"
            ]
        }}
    ]
}}
📌 Reasoning Explanation:
Step 1: Retrieve the student’s roll number from their semester result (Gazette Report).
Step 2: Use that roll number to search for seating arrangements in the official Seating Plan document.

📌 Example 3: Query for Fee Structure
🔍 Query: "How much is the fee for B.Tech in IT at NSUT? and what is the summer semester start date for 2025?"

✅ Generated Action Plan:
{{
    "action_plan": [
        {{
            "step": 1,
            "reason": "Retrieve the latest fee structure for B.Tech IT.",
            "specific_queries": [
                {{
                    "query": "NSUT B.Tech IT fee structure 2025",
                    "specificity": 0.6,
                    "expansivity": 0.7,
                    "keywords": ["fee structure", "B.Tech IT", "2025"]
                }},
                {{
                    "query": "Summer semester start date for 2025 at NSUT",
                    "specificity": 0.6,
                    "expansivity": 0.3,
                    "keywords": ["Summer semester", "2025"]
                }}
            ],
            "document_queries": [
                "Fee Structure Document",
                "Academic calendar for 2025",
                "summer semester guidelines"
            ]
        }}
    ]
}}
📌 Reasoning Explanation:
Step 1: Directly retrieve the Fee Structure and summer semester document since the information is likely stored there. no more steps needed since the information is not interdependent, all can be inquired in 1 step


📌 Example 3: result of a student
🔍 Query: "3rd semester result of a student X in branch Y"

✅ Generated Action Plan:
{{
    "action_plan": [
        {{
            "step": 1,
            "reason": "Retrieve the Result directly as result is stored with both roll number and names",
            "specific_queries": [
                {{
                    "query": "student X semester 2 branch Y result 2025",
                    "specificity": 0.6,
                    "expansivity": 0.4,
                    "keywords": ["X, "Y", "2nd semester", "2025"]
                }},
                
            ],
            "document_queries": [
                "Official gazette report for 2nd semester Y branch 2025"
            ]
        }}
    ]
}}
📌 Reasoning Explanation:
Step 1: Directly retrieve the Fee Structure and summer semester document since the information is likely stored there. no more steps needed since the information is not interdependent, all can be inquired in 1 step


📌 Final Reminder
🚨 STRICT RULES TO ENFORCE:
✔ Action plan must be structured step-by-step.
✔ Each step has at least one specific query.
✔ Document queries should only be included if relevant.
✔ Use previous user knowledge if available.
✔ Queries must be highly precise and optimized for retrieval.
✔ DO NOT HALLUCINATE AND GENERATE INFORMATION YOURSELF, ONLY USE INFORMATION YOU CAN ACCURATELY LOGICALLY INFER OR IS DIRECTLY GIVEN

📌 Previously Known User Knowledge: (maybe irrelvant, ignore if irrelevant to the query)

{user_knowledge}

If in doubt, refine the search further. Never assume.
"""