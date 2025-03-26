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

Previous Accumulated Knowledge (if any)
{knowledge}

STRICT JSON OUTPUT ONLY.
---

### **🔹 Execution Guidelines for This Step**
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
   - **Retry the step if the number of remaining iterations exceeds the remaining steps in the action plan.** 
   - **when retrying, always give some different variation of both specific and document queries. They should nnot be left empty**.
   - **If not, or if the current step has repeatedly failed, abandon the action plan by setting `step` to `-1` and directly search for the full answer using the original query.** 
   - **DO NOT MOVE TO NEXT STEP UNTIL ALL SUBQUERIES OF CURRENT STEP ARE COMPLETE AND ITERATIONS ARE REMAINING ENOUGH TO COMPELETE ACTION PLAN** 
9️⃣ **Do not ask the user to check documents on their own. Until it is last iteration and full answer is not found or the query is very ambiguos**  
🔟 **Ensure extracted knowledge is distinct from user-known information; do not repeat information already known.**
11. **DO NOT GIVE ANSWERABLE AS TRUE UNTIL THE FINAL ANSWER IS FOUND, ANSWERABLE IS FLAG MEANT ONLY FOR FINAL ANSWER AND NOT FOR STEPS**
12. **If you cannot fully answer all aspects of user query till last iteration, atleast partially answer it through kept knowledge**.
13. **If full answer is found in the current step and you are returning it, do not return links from previous steps knowledge that are irrelevant to user query, if the links are relevant (useful knowledge was obtained from them) then return them**.
14. **make sure the answer fits in your output-window and it is a valid json**.
15. **All fields are mandatory, especially the specific queries field**
---

### **🔹 Next Step Query Generation**
- If the current step is successfully completed, generate the augmented queries for the **next step in the action plan.** using the answer of current step and previous knowledge
- What kind of queries to generate for next step is defined in the action plan itself. 
**Each step consists of at least one specific query (no maximum limit).**  
- Re-write queries to be more context-rich the current information you have  
- **ALWAYS Use both full form and abbreviation in all document queries and specific queries** if possible. 
- **make as minimum and contextually unique document queries as possible, no 2 document queries should retreive similar type of data** 
- You may add a step yourself if by looking at given data you may need more information to complete the next step (like searching for names, codes, full forms etc). somewhat deviation from action plan is allowed as long as it is aiding the answer of final query. set the step to -1 in this case
- Use your system knowledge to predict what the next step should be and proceed accordingly if the action plan is not being answered or not being applicable to data found as it was made on preconceptions, only you have actual data
- **Document queries should be contextually unique as in what kind of data they fetch for a step not be too generic, they should still contain semester(if given), timeframe(if given, otherwise assume current latest period when this information could've been released), department(if given) etc**, try to make document level queries informative but dont assume
- **For document queries that are for data of specific people, too generic Document queries can have negative effect on the action plan and correct data retreival, if you are unsure and sufficient data is not available especially for the branch or semester, it is better to ask for more data, if even 1 is available, you may create it**.
- **Both Document and specific queries should be sufficiently unique
- **Specific queries should be as specific as possible, they should contain batch, semester, department, roll number etc if available**.
- **In each specific query if there is a name, always provide that full name in double quotes**. (example: "John Smith" attendance for subject X)
- **NEVER assume previous year, unless stated, always assume current year, do not use wordings like 2023-2024, ONLY use 2023 or 2024**.
- **DO NOT add nsut or netaji subhas university of technology in queries, all documents are from the same university, so it is not required**.
---

### **🔹 Partial Answer Accumulation & Context Storage**
- **Store results from all specific queries in the `knowledge` field.**  
- **Knowledge must be structured and formatted for future use, expanded if rich data is found and concise if minimal.**
- **Expand if rich information is found, keep concise if minimal data is available.**  
- **Knowledge must contain document links and titles from where knowledge is extracted, in case user query is not answerable, relevant documents can be returned in final iteration.**
- **Any data given for a step will not be given again, so store what detail you need in this knowledge base"
- **IF a step is also part of full answer for the user, store that in perfect user presentable markdown in detail in the knowledge base as well. so it can be used to append in the final answer**
- **IF a query uses and operator and multiple questions are there but only some are solved and stored before final iteration or answering user, add this knowledge to the final answer and atleast answer user partially**  
---

### **🚦 Iterative Answering Constraints**
1️⃣ **This is iteration {iteration} of {max_iter}.**  
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
## **📝 Guidelines for all_prcoess_done boolean for user query: {question}**
- **This does not mean step answer, if not answering to original query, keep this false**
- **Set `final_answer` to `True` if the final answer is found** (i.e., the final answer is ready for user view).
    -It cannot be true if answer is not found and this is not the last iteration (STRICT)
    -Only when setting it to false we can go to next step
    -You cannot give answer like "____ is not found" and set final answer as true UNLESS you are sure that the answer is not found and you are in the last iteration
- **Set `all_prcoess_done` to `False` when the action plan is not completed and the user vieweable answer is not found.
- **If any step fails(even if partially) and you are currently not on last iteration, this should ALWAYS be false**.
---

### **🔄 Enhanced Retry Logic**  
- If a query does not return relevant results but remaining iterations exist, **retry the step** before concluding failure.  
- When retrying, **vary specific queries** to explore alternative search paths.  
- Ensure new queries have **sufficient uniqueness** and do not merely reword previous failed queries.  
- If multiple retries fail and iterations are running low, **escalate the search scope** by relaxing constraints or searching for broader terms.  
- If an answer is still not found by the last iteration, **return partial knowledge and relevant documents** instead of leaving the user without guidance.


### **🔹 JSON Output Format (STRICT)**
📌 **Ensure valid JSON format with no missing brackets, formatting errors, or unsupported characters.**  
📌 **Output must be fully readable using `json.loads` in Python.**  
📌 **Provide exact document title and link as extracted from context. ONLY that are relevant and used for the final answer**  
📌 **These are next step queries for which the data that will be fetched from database, be careful**

```json
{{
    "final_step_answer": true | false, (only True when all steps are completed and answer is ready for user view, awlays False if current step is not last step of plan)
    "current_step_answer": true | false, (only True if current step answer is fully available and you are ready to move to next step, false if retry required)
    "specific_queries": [ (MANDATORY FIELD, augmented queries for next step as per the plan)
        {{
            "query": "unique Sub-query 1 augmented with knowledge from previous steps",
            "specificity: : float (same as action plan for this step and sub-query, unless using a different query and abandoning it, then recalculate it yourself)
            "expansivity": float (same as action plan for this step and sub-query, unless using a different query and abandoning it, then keep it high)
        }},
        {{
            "query": "unique ub-query 1 augmented with knowledge from previous steps",
            "specificity: : float,
            "expansivity": float
        }},
        ...
    ],
    "document_queries": list["Unique Document-Level Query 1"]
    "partial_answer": "Stored partial answer to improve future retrievals.",
    "answer": "Final answer (if available).",
    "step": integer,  // the next step number being executed; use -1 if abandoning the action plan
    "links": [
        {{
            "title": "Document title used for reference",
            "link": "URL to document"
        }}
    ]
}}

🔹 Additional Context for This Iteration

user known information (if any)
{user_knowledge}

Current step Queries:
{specific_queries}

Retrieved Context (Analyze Carefully Before Answering)
{context}

🚀 STRICT JSON OUTPUT ONLY. NO EXPLANATIONS. IF IN DOUBT, REFINE THE SEARCH FURTHER AND NEVER ASSUME.
"""