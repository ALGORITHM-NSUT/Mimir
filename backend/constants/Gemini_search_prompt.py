Gemini_search_prompt =  """📅 **Current Date:** {current_date}  
🔎 **Original User Query:** "{question}"  
🔄 **Iteration:** {iteration} of {max_iter}  
🔄 **Step of Action Plan:** {step}  

Schema of search:
📚 **Full Action Plan:**  
{action_plan}  

🔍 **Current Step Queries:**  
{specific_queries}  

---

### **🔹 Execution Guidelines for This Step**
1️⃣ **Focus only on the current step of the action plan.**  
2️⃣ **Extract exact information**—use precise figures, dates, and details from documents.  
3️⃣ **Use "Publish Date" as the primary sorting metric** to prioritize the most relevant documents.  
4️⃣ **If multiple documents provide conflicting information:**  
   - Default to **the latest version**.  
   - Clearly specify which document was used.  
5️⃣ **Do not summarize documents if the exact answer is available.**  
6️⃣ **Do not include unnecessary surrounding context—provide only the precise answer.**  
7️⃣ **Provide information in a tabular format whenever possible.**  
   - Infer meaningful **columns and rows** if applicable.  

📌 **Example Table Formatting:**  
| Column A | Column B | Column C |  
|----------|----------|----------|  
| Data 1   | Data 2   | Data 3   |  

8️⃣ **If the answer is not found in the current step:**  
   - **Retry the step only if the number of remaining iterations exceeds the remaining steps in the action plan.**  
   - **If not, or if the current step has repeatedly failed, abandon the action plan by setting `step` to `-1` and directly search for the full answer using the original query.**  
9️⃣ **Do not ask the user to check documents on their own. Until it is last iteration and full answer is not found or the query is very ambiguos**  
🔟 **Ensure extracted knowledge is distinct from user-known information; do not repeat information already known.**
11. **DO NOT GIVE ANSWERABLE AS TRUE UNTIL THE FINAL ANSWER IS FOUND, ANSWERABLE IS FLAG MEANT ONLY FOR FINAL ANSWER AND NOT FOR STEPS**

---

### **🔹 Next Step Query Generation**
- After executing the current step, generate queries for the **next step** of the action plan if applicable. 
- If the current step is successfully completed, generate the augmented queries for the **next step in the action plan.** using the answer of current step and previous knowledge
- What kind of queries to generate for next step is defined in the action plan itself.   

---

### **🔹 Partial Answer Accumulation & Knowledge Storage**
- **Store results from all specific queries in the `knowledge` field.**  
- **Knowledge must be structured and formatted for future use, expanded if rich data is found and concise if minimal.**
- **Expand if rich information is found, keep concise if minimal data is available.**  
---

### **🚦 Iterative Answering Constraints**
1️⃣ **This is iteration {iteration} of {max_iter}.**  
2️⃣ **The action plan must be completed within these iterations.**  
3️⃣ **Retry a failed step only if remaining iterations > remaining steps in the action plan.**  
4️⃣ **If the full answer for Original User query is found before completing all steps, terminate the action plan early and return the final answer.**  
5️⃣ **If data for a future step is already available, skip to that step and update the `step` accordingly.**  
6️⃣ **If the current step fails and remaining iterations are insufficient to complete the plan, set `step` to `-1` and search directly for the final answer using the original query.**

---
## **📌 Guidelines for Specificity Score (`specificity`)**
- Assign a **float value between `0.0` and `1.0`** to indicate how specific the original query is.  
- **Use the following reference scale:**  
  - **`1.0` → Very specific** (e.g., `"What was student X's SGPA in 5th semester?"`)  
  - **`0.5` → Moderately specific** (e.g., `"Tell me everything about professor X who taught CSE in 2024?"`)  
  - **`0.0` → Very broad** (e.g., `"Tell me about placements at NSUT?"`)  
- **The specificity score applies to each specific query** inside the action plan.  

---

### **🔹 JSON Output Format (STRICT)**
📌 **Ensure valid JSON format with no missing brackets, formatting errors, or unsupported characters.**  
📌 **Output must be fully readable using `json.loads` in Python.**  
📌 **Provide exact document title and link as extracted from context.**  
📌 **These are next step queries for which the data that will be fetched from database, be careful**
```json
{{
    "full_answer": true | false, (this indicates the answer to original query: {question} is found compeletely or not)
    "specific_queries": [
        {{
            "query": "Sub-query 1 augmented with knowledge from previous steps",
            "keywords": ["Keyword 1", "Keyword 2"], (same as action plan, replaced with actual data values from previous steps)
            "specifity: : float (same as action plan for this step and sub-query, unless using a different query and abandoning it, then recalculate it yourself)
        }},
        {{
            "query": "Sub-query 1 augmented with knowledge from previous steps",
            "keywords": ["Keyword 1", "Keyword 2"],
            "specifity: : float 
        }},
        ...
    ],
    "knowledge": "Stored partial answer to improve future retrievals.",
    "answer": "Final answer (if available).",
    "step": integer,  // the next step number being executed; use -1 if abandoning the action plan
    "links": [
        {{
            "title": "Document title used for reference",
            "link": "URL to document"
        }}
    ]
}}

🔹 Important Rules

🚨 STRICT CONSTRAINTS TO AVOID ERRORS
DO NOT make full_answer = True until either the entire action plan is compelete, the full user query answer is found or the iterations are compelete
YOU ARE NOT ALLOWED TO SAY "I am unable to find answer until plan is compelete or iterations are compelete"
NEVER hallucinate missing details.
NEVER include irrelevant documents.
ONLY provide information explicitly available in the retrieved context.
DO NOT modify user queries beyond necessary refinement.
DO NOT provide any response outside the JSON format.
DO NOT provide user exactly the information they already know

🛑 Handling Edge Cases
If no relevant documents are found
Provide "answerable": false.
Suggest high-quality sub-queries.
Offer relevant links (if available).
If the user’s query is unrelated to the available context
Politely reject the query instead of fabricating an answer.
DO NOT ASK USER QUESTIONS UNTIL IT IS LAST ITERATION.


🔹 Additional Context for This Iteration
Previous Accumulated Knowledge (if any)
{knowledge}

user known information (if any)
{user_knowledge}

Current step Queries:
{specific_queries}

Retrieved Context (Analyze Carefully Before Answering)
{context}

🚀 STRICT JSON OUTPUT ONLY. NO EXPLANATIONS. IF IN DOUBT, REFINE THE SEARCH FURTHER AND NEVER ASSUME.
"""