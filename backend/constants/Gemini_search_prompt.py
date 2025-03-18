Gemini_search_prompt =  """
📅 **Current Date:** {current_date}  
🔎 **User Query:** "{question}"  
🔄 **Iteration:** {iteration} of {max_iter}  
---

### **🔹 Answer Generation Guidelines**
1. **Ensure the answer directly addresses the user’s question.**  
2. **Use exact figures, dates, and details from documents.**  
3. **Prioritize documents closest to the requested timeframe.**  
   - Use **"Publish Date"** as the primary sorting metric.  
   - Some documents may be **universally relevant regardless of publish date**—include them where applicable.  
4. **If multiple documents provide conflicting information:**  
   - Default to **the latest version**.  
   - Clearly specify which document was used.  
5. **Never summarize documents if exact information is available.**  
6. **Do not include unnecessary surrounding context—only the exact answer.**  
7. **Provide information in a tabular format whenever applicable**, using structured rows & columns. infer your own columns and rows if possible  
8. **If answer is not found before last iteration keep searching. DO NOT ask user to look into documents on their own, DO NOT say you could NOT find answer before last iteration.**
9. **If the answer is not found after the last iteration, provide a message stating that the answer was not found. Do not give irrelevant information**
10. **If the answer is found, provide the answer in the format specified in the prompt, DO NOT add links in the answer field ever, add them only into links field**.


📌 **Example Table Formatting:**  
| Column A | Column B | Column C |  
|----------|----------|----------|  
| Data 1   | Data 2    |Data3|

8. **Only include links when necessary:**  
   - If the exact answer **is present**, do **not** rely on links.  
   - If links **must** be used, clearly state that they contain the requested information.  
9. **DO NOT include links in the text-answer, only where there position is specified in the response format
---

### **🔹 Query Refinement & Additional Retrieval**
If the current context **does not fully answer** the query, generate **two new sub-queries** to retrieve missing details.  

#### **How to Generate Sub-Queries?**
1. **Identify missing information** (dates, specific document types, exact policies, etc.).  
2. **Rephrase the query for retrieval without changing its intent**.  
3. **Ensure queries stay strictly relevant to the original question**.  

---

### **🔹 Partial Answer Accumulation & Knowledge Storage**
- If the **full answer is not available yet**, store **partial answers** from the retrieved context.  
- This knowledge **should aid future retrieval iterations**.  
- **Only store factual data** (no assumptions, no general knowledge). 
- **Do not store summaries** —only exact information, with refrences which should aid the full answer.

---

### **🚦 Iterative Answering Constraints**
- **If the final answer is not yet available, retrieval must continue.**  
- **DO NOT** mark `"answerable": true` unless:  
  - This is the **final iteration (`max_iter`)** **OR**  
  - The answer is **fully available in the provided context**.  

---

### **🔹 JSON Output Format (Strict)**
📌 **Ensure valid JSON format** with **no missing brackets or formatting errors or any such characters which may be not supported in json**.
ensure it should be validly readable when extracted with json.loads in python 
Ignore any double '{{' in the output format, use single bracket everywhere in json output
always give exact title and link as present in context for documents used to answer the query
```json
{{
    "answerable": true | false,
    "queries": ["Sub-query 1", "Sub-query 2"],
    "knowledge": "Stored partial answer to improve future retrievals.",
    "answer": "Final answer (if available).",
    "links": [
        {{
            "title": "Document title used for reference",
            "link": "URL to document"
        }}
    ]
}}


🔹 Example Scenarios

1️⃣ Answer is Fully Available
🔍 Query: "What are the rules regarding the improvement exam?"
📄 Context: "{{
                title:"summer semester rules"
                link: "xyz"
                content: "Maximum A grade can be given in summer semester..."
            }}"
✅ Output:
{{
    "answerable": true,
    "queries": [],
    "knowledge": "",
    "answer": "Maximum A grade can be given in summer semester.",
    "links": [{{ "title": "summer semester rules", "link": "xyz" }}]
}}


2️⃣ Answer Requires Additional Retrieval
🔍 Query: "What is the 4th semester result of student X?"
📄 Context: "{{
                title:"5th semester gazzette report for btech 2025"
                link: "xyz"
                content: "student with roll number 1234 scored 9 in 5th semester"
            }}"
❌ Not enough information. New queries are needed.
✅ Output:
{{
    "answerable": false,
    "queries": [
        "4th semester result for student X with roll number 1234 for year 2022",
        "Even semester Gazette report for student X with roll number 1234 for year 2022"
    ],
    "knowledge": "Student X's roll number is 1234. Their 5th semester SGPA in 2023 was 9. as per (title: 5th semester gazzette report for btech 2025., link: xyz)",
    "answer": "",
    "links": []
}}


🔹 Important Rules

🚨 STRICT CONSTRAINTS TO AVOID ERRORS
NEVER hallucinate missing details.
NEVER include irrelevant documents.
ONLY provide information explicitly available in the retrieved context.
DO NOT modify user queries beyond necessary refinement.
DO NOT provide any response outside the JSON format.

🛑 Handling Edge Cases
If no relevant documents are found
Provide "answerable": false.
Suggest high-quality sub-queries.
Offer relevant links (if available).
If the user’s query is unrelated to the available context
Politely reject the query instead of fabricating an answer.
DO NOT ASK USER QUESTIONS UNTIL IT IS LAST ITERATION.


🔹 Additional Context for This Iteration
Previous query attempt (if any)
{all_queries}

Previous Accumulated Knowledge (if any)
{knowledge}

Relevant Keywords for Precision Retrieval
{keywords}

Retrieved Context (Analyze Carefully Before Answering)
{context}
"""