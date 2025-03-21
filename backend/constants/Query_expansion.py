Query_expansion_prompt = """Given the following query: "{query}" and the current date "{current_date}" (for reference in this session), your task is to create an **action plan** to retrieve information step by step, based on your system knowledge of where different types of data are stored.  

🚨 **STRICT RULES TO FOLLOW:**  
1️⃣ **Break down the query into logical steps.**  
2️⃣ **Each step consists of at least one specific query (no maximum limit).**  
3️⃣ **For "AND" queries (multiple pieces of information needed), create multiple specific queries per step.**  
4️⃣ **Determine if specific queries can be resolved using document-level searches or require direct retrieval.**  
5️⃣ **An action plan can have a minimum of 1 step and a maximum of 3 steps.**  
6️⃣ **If required, use previously known user knowledge to refine queries.**  

---

## **📌 Action Plan Structure**
- **Each step must have at least one "specific query."**  
- **Document-level queries may be 0 or more per step.**  
- **Each specific query must have a specificity score (`0.0 - 1.0`) and extracted keywords.**  
- **Ensure the action plan is structured for efficient retrieval.**  

---

## **📌 Guidelines for Query Expansion**
- Generate **specific queries** to retrieve data step-by-step.  
- **Ensure meaningful variation**:
  - Queries should be **precise and retrieval-ready** (e.g., add batch, semester, department, roll number if available).  
  - **Modify numeric values logically** (e.g., even ↔ odd semester if applicable).  
  - If timeframe is missing, **infer a reasonable session** (but never predict future years).  
- **Use both full form and abbreviation** if relevant.  
- **Maintain original query intent**—no unnecessary generalization. 
- whenever asking for roll number check for result using the **most recent** semester for which result is for sure declared(You need to estimate it using current date and your system knowledge, even semester end in may, odd in december, results declared 15 days later) 
---

## **📌 Guidelines for Specificity Score (`specificity`)**
- Assign a **float value between `0.0` and `1.0`** to indicate how specific the original query is.  
- **Use the following reference scale:**  
  - **`1.0` → Very specific** (e.g., `"What was student X's SGPA in 5th semester?"`)  
  - **`0.5` → Moderately specific** (e.g., `"Tell me everything about professor X who taught CSE in 2024?"`)  
  - **`0.0` → Very broad** (e.g., `"Tell me about placements at NSUT?"`)  
- **The specificity score applies to each specific query** inside the action plan.  

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
At least one "specific query" per step each should be very unqiue(max limit of 3) do not make more than required.
"Document queries" can be 0 or more per step.
Each "specific query" must have specificity and extracted keywords.
If multiple peices of information do not depend upon each other, they can be inquired in one step. different document queries can be inquired in the same step.
Only generate multiple steps if answer of 1 step will be used to get enough data for next step
Document_queries list can contain mmore tha 1 type of unrelated documents, try your best to reduce steps 
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
                    "keywords": ["Diwali", "holiday", "2025"]
                }}
            ],
            "document_queries": [
                "Official Notices & Circulars",
                "Administrative Policies"
            ]
        }}
    ]
}}
📌 Reasoning Explanation:
Step 1: First, search the Academic Calendar for all listed holidays.
Step 2: If Diwali isn't explicitly listed, verify with notices or circulars.

📌 Example 2: Query for Seating Arrangement of a Student
🔍 Query: "Where is my seating arrangement for the end semester exam for A semester in B branch?"

✅ Generated Action Plan:
{{
    "action_plan": [
        {{
            "step": 1,
            "reason": "Retrieve the roll number of the student X using any of their previous semester result.",
            "specific_queries": [
                {{
                    "query": "end semester result of student X in branch B",
                    "specificity": 0.8,
                    "keywords": ["user", "B", "result"]
                }}
            ],
            "document_queries": [
                "Official Gazette Report for branch B"
            ]
        }},
        {{
            "step": 2,
            "reason": "Use the roll number to find the seating arrangement for the upcoming end-semester exam.",
            "specific_queries": [
                {{
                    "query": "Seating arrangement for roll number X in end-semester exam 2025",
                    "specificity": 0.9,
                    "keywords": ["seating arrangement", "endsem", "roll number X", "2025"]
                }}
            ],
            "document_queries": [
                "Seating Plan for End Semester Exam for A - 1 semester for branch B"
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
                    "keywords": ["fee structure", "B.Tech IT", "2025"]
                }},
                {{
                    "query": "Summer semester start date for 2025 at NSUT",
                    "specificity": 0.6,
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

📌 Example 4: All information about student X
🔍 Query: "All information present about a student X from branch B.Tech ITNS in Z semester"

✅ Generated Action Plan:
{{
    "action_plan": [
        {{
            "step": 1,
            "reason": "with roll number X, finding student’s details may be easier and we will also get result simultaneously",
            "specific_queries": [
                {{
                    "query": "student X Z - 1 semeseter result for branch Y",
                    "specificity": 0.8,
                    "keywords": ["X", "ITNS", "Z - 1 semester"]
                }}
            ],
            "document_queries": [
                "result for B.tech Z semester",
            ]
        }},
        {{
            "step": 2,
            "reason": "Now we will have roll number of student X, so we can search for student’s details in all documents.",
            "specific_queries": [
                {{
                    "query": "student X roll number A information ITNS branch",
                    "specificity": 0.8,
                    "keywords": ["X", "ITNS", "A"]
                }}
            ],
            "document_queries": []
        }}
    ]
}}
📌 Reasoning Explanation:
Step 1: with roll number it will be easier to find a students information
Step 2: Now we will have roll number of student X, so we can search for studentz’s details in all documents.

📌 Example 5: All information about student X
🔍 Query: "Student X 2nd semester result csai branch"
✅ Generated Action Plan:
{{
    "action_plan": [
        {{
            "step": 1,
            "reason": "all semester result contain roll numbers so answer it directly in 1 step",
            "specific_queries": [
                {{
                    "query": "student X 2nd semester result CSAI NSUT gazette report",
                    "specificity": 0.8,
                    "keywords": ["X", "CSAI", "2nd semester", "result", "gazette report"]
                }}
            ],
            "document_queries": [
                "result for B.tech CSAI 2nd semester",
            ]
        }}
    ]
}}
📌 Reasoning Explanation:
step1: Directly search the user query because it cannot be broken down into further steps, no need to get roll numbers seperately as they will be retreived with result.

📌 Final Reminder
🚨 STRICT RULES TO ENFORCE:
✔ Action plan must be structured step-by-step.
✔ Each step has at least one specific query.
✔ Document queries should only be included if relevant.
✔ Use previous user knowledge if available.
✔ Queries must be highly precise and optimized for retrieval.
✔ DO NOT HALLUCINATE AND GENERATE INFORMATION YOURSELF, ONLY USE INFORMATION YOU CAN ACCURATELY LOGICALLY INFER OR IS DIRECTLY GIVEN

🔍 Additional Context for This Query Execution 📌 Previously Known User Knowledge:

{user_knowledge}

If in doubt, refine the search further. Never assume.
"""