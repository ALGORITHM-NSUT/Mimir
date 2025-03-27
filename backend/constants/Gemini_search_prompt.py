Gemini_search_prompt =  """📅 **Current Date:** {current_date}  
🔎 **Original User Query:** "{question}"  
🔄 **Iteration:** {iteration} of {max_iter}  
🔄 **Step of Action Plan:** {step}  
{deviation}

Schema of search:
📚 **Full Action Plan:**  
{action_plan}  

🔍 **Current Step Queries:**  
{specific_queries}  

**Accumulated Knowledge throuh previous steps** (if any)
{knowledge}

STRICT JSON OUTPUT ONLY.
---

### **🔹 Execution Guidelines for This Step**
1. **Your objective is to answer either the current step question or the original user question, based on what you can find in the context**
2. **If answering the current step question not final answer then you must make context enriched specific and document queries for the next step as detailed in the action plan**
3. **Try to answer as quickly as possible with the information ou have, don't be very specific about the user request**.
1️⃣ **Focus only on the current step of the action plan.**  
2️⃣ **Extract exact information**—use precise figures, dates, links and details from documents.  
3️⃣ **Use "Publish Date" as the primary sorting metric** to prioritize the most relevant documents.  
4️⃣ **If multiple documents provide conflicting information:**  
   - Default to **the latest version**. and just summarize the previous version  
   - Clearly specify which document was used with dates.  
   - Tell user that multiple documents were found and give link to both
5️⃣ **Do not summarize documents if the exact answer is available.**  
6️⃣ **Do not include unnecessary surrounding context—provide only the precise answer.**  
7️⃣ **Provide information in a tabular format whenever possible.**  
   - Infer meaningful **columns and rows** if applicable.

📌 **Example Table Formatting:**  
| Column A | Column B | Column C |  
|----------|----------|----------|  
| Data 1   | Data 2   | Data 3   |  

8️⃣ **If the answer is not found in the current step:**
   - **You may Retry a step maximum of 1 time, then you must move to next step, it will be told to yu if this a a retry then you cannot retry this** 
   - **when retrying, always give some different variation of both specific and document queries. They should nnot be left empty**.
   - **If not, or if the current step has repeatedly failed, abandon the action plan by setting `step` to `-1` and directly search for the full answer using the original query.** 
   - **DO NOT MOVE TO NEXT STEP UNTIL ALL SUBQUERIES OF CURRENT STEP ARE COMPLETE AND A RETRY IS REMAINING TO COMPELETE ACTION PLAN**
9. **If full answer is found in the current step and you are returning it, do not return links from previous steps knowledge that are irrelevant to user query, if the links are relevant (useful knowledge was obtained from them) then return them**.
10. **make sure the answer fits in your output-window and it is a valid json**.
11. **All fields are mandatory, especially the specific queries field**.
12. **If more data is required to answer the question, ask the user for it. by adding it to the answer field and making final_answer = true**.(only ask user if you don't know where or how to get answer)
13. **No need to verify data is the action plan doesn't say so**.
---

### **🔹 Next Step Query Generation**
- If the current step is successfully completed, generate the context rich queries for the **next step in the action plan.** using the answer of current step and previous knowledge.
- queries in which you have to augment actually obtained data is defined in the action plan itself. 
- **Each step consists of at least 1 specific query (no maximum limit and cannot be empty).**   
- **ALWAYS Use both full form and abbreviation in all document queries and specific queries** if possible. 
- **make as minimum and contextually unique document queries as possible, no 2 document queries should retreive similar type of data** 
- You may add a step yourself if by looking at given data you may need more information to complete the next step (like searching for names, codes, full forms etc). somewhat deviation from action plan is allowed as long as it is aiding the answer of final query. set the step to -1 in this case
- Use your system knowledge to predict what the next step should be and proceed accordingly if the action plan is not being answered or not being applicable to data found as it was made on preconceptions, only you have actual data
- **Document queries should be contextually unique as in what kind of data they fetch for a step not be too generic, they should still contain semester(if given), timeframe(if given, otherwise assume current latest period when this information could've been released), department(if given) etc**, try to make document level queries informative but dont assume
- **Specific queries should be as specific as possible based on type of data required, they should contain batch, semester, department, roll number etc. (if available) and required to get data that depends on it, don't include it for common data that does not depend on such fields as per your system knowledge**.
- **In each specific query if there is a name, always provide that full name in double quotes**. (example: "John Smith" attendance for subject X)
- **NEVER assume year unless stated or is very clear by the kind of query user asks, do not use wordings like 2023-2024, ONLY use 2023 or 2024**, for year assumption use your system knowledge, odd semester cannot be on-going in jan to july, even sem in aug to dec.
- **DO NOT add nsut or netaji subhas university of technology in queries, all documents are from the same university, so it is not required**.
---

### **🔹 Partial Answer Accumulation & Context Storage**
- **Store results from all specific queries in the `knowledge` field.**  
- **Knowledge must be structured and formatted for future use, expanded if rich data is found and concise if minimal.**
- **Any data given for a step will not be given again, so store what detail you need in this knowledge base"
- **IF a query uses 'and' operator and multiple questions are there but only some are solved and stored before final iteration or answering user, add this knowledge to the final answer and atleast answer user partially**  
---

### **🚦 Iterative Answering Constraints**
1️⃣ **This is iteration {iteration} of {max_iter}. These are max tries you will get, you will be rewarded for how much earlier you do this**  
2️⃣ **The action plan must be completed within these iterations.**  
3️⃣ **Retry a failed step only if remaining iterations > remaining steps in the action plan.**  
4️⃣ **If the full answer for Original User query is found before completing all steps, terminate the action plan early and return the final answer.**  
5️⃣ **If data for a future step is already available, skip to that step and update the `step` accordingly.**  
6️⃣ **If the current step fails and remaining iterations are sufficient to complete the plan, retry the step. give step = current step in json with ONLY the failed queries**
7. **If the current step fails and IF and ONLY IF remaining iterations are insufficient to complete the plan, set `step` to `-1` and search directly for the final answer using the original query.**
8. **If it is the last iteration and user query is not directly answered, return relevant documents with links and titles and tell user answer can be found here.**
---

## **📌 Guidelines for Specificity Score (`specificity`)**
- Assign a **float value between `0.0` and `1.0`** to indicate how specific the original query is.  
- **Use the following reference scale:**  
  - **`1.0` → Very specific** (e.g., `"What was student X's SGPA in 5th semester?"`)  
  - **`0.5` → Moderately specific** (e.g., `"Tell me everything about professor X who taught CSE in 2024?"`)  
  - **`0.0` → Very broad** (e.g., `"Tell me about placements at NSUT?"`)  
- **The specificity score applies to each specific query** inside the action plan.  

---

## **📌 Guidelines for Expansive score (`expansivity`)**
- Assign a **float value between `0.0` and `1.0`** to indicate how large the answer of the query can be expected to be.
- **Use the following reference scale:**
- **`1.0` → Very large** (e.g., `"Give me the academic calendar"`)
- **`0.5` → Moderately large** (e.g., `"Tell me about all the professors in CSE department?"`)
- **`0.0` → Very small** (e.g., `"Tell me about the student X's roll number?"`)

---
## **📝 Guidelines for final_answer boolean (basically means if you are ready to converse with user or not)**
- **True when final answer to the original user query is found or iterations have compeleted or you need to ask user for more data to answer this query (only ask user if you don't know where or how to get answer)**.
    -It cannot be true if answer is not found unless this is the last iteration
    -Only when setting it to false we can go to next step
- **If any step fails and you are currently not on last iteration, this should be false**.
- **Try to answer user as quickly as possible**.
- **If you are at final step of plan and have sufficient information for user, quickly answer user and set this to true**.
- **when final answering use al information you have in previously accumulated knowledge annd current context knowledge to create a comprehennsive answer**.
---

### **🔄 Enhanced Retry Logic**  
- If this step is a retry, you cannot retry it again
- If a query does not return relevant results but it is not a retry, **retry the step** before concluding failure.  
- When retrying, **vary specific queries and document queries** to explore alternative search paths.  
- Ensure new queries have **sufficient uniqueness** and do not merely reword previous failed queries.  
- If a retry also fails **escalate the search scope** by relaxing constraints and giving empty document queries as it will enable search throughout whole database (this is last resort as it is inaccurate but good variety of data is available).  
- If an answer is still not found by the last iteration, **return partial knowledge and relevant documents** instead of leaving the user without guidance.
- Only 1 retry per step is allowed. If it fails, we move to next step. If we are at last step, we return relevant documents and tell user to search here.

### **🔹 JSON Output Format (STRICT)**
📌 **Ensure valid JSON format with no missing brackets, formatting errors, or unsupported characters.**  
📌 **Output must be fully readable using `json.loads` in Python.**  
📌 **Provide exact document title and link as extracted from context. ONLY that are relevant and used for the final answer**  
📌 **These are next step queries for which the data that will be fetched from database, be careful**
📌 **specific_queries and document_queries field can never be empty until you're returning either the full answer or the final answer is not found and you want user to give you more information**.

```json
{{
    "final_answer": true | false, (ready to converse with user or not)
    "current_step_answer": true | false, (only True if current step specific query answer is fully available and you are ready to move to next step, false if retry required)
    "specific_queries": [ (MANDATORY FIELD, NEVER EMPTY, augmented queries for next step as per the plan or new ones if plan is abandoned or current step queries with different wordings if failed)
        {{
            "query": "unique Sub-query 1 changed with knowledge from previous steps",
            "specificity: : float (same as action plan for this step and sub-query, unless using a different query and abandoning it, then recalculate it yourself)
            "expansivity": float (same as action plan for this step and sub-query, unless using a different query and abandoning it, then keep it high)
        }},
        {{
            "query": "unique ub-query 1 changed with knowledge from previous steps",
            "specificity: : float,
            "expansivity": float
        }},
        ...
    ],
    "document_queries": list["Unique Document-Level Query 1"]
    "partial_answer": "Stored partial answer to improve future retrievals.",
    "answer": "Final answer (if available).",
    "step": integer range 1 to max steps in plan,  // the next step number being executed; use -1 if abandoning the action plan
    "links": [
        {{
            "title": "Document title used for reference",
            "link": "URL to document"
        }}
    ]
}}
IN ANY CASE YOU MUST NOT DEVIATE FROM THIS ANSWER FORMAT
🔹 Additional Context for This Iteration

user known information (if any)
{user_knowledge}

Current step Queries:
{specific_queries}

Retrieved Context (Analyze Carefully Before Answering)
{context}

🚀 STRICT JSON OUTPUT ONLY. NO EXPLANATIONS. IF IN DOUBT, REFINE THE SEARCH FURTHER AND NEVER ASSUME."""