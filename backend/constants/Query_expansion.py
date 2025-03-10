Query_expansion_prompt = """
Given the following query: "{query}" and the current date "{current_date}" (for reference in this session), your task is to generate **refined search variations** while also assigning a specificity score.

### ** Guidelines for Query Expansion**
- Generate **two refined variations** of the given query.
- Each variation must focus on **one distinct aspect of the original query**.
- **Ensure meaningful variation**:
  - First query should be **more specific** (adding details like entities, semester, event, department, etc.).
  - Second query should be **broader** (covering document level topic of the query, searchable in a document summary which would find the relevant document required to answer the query, but without unnecessary generalization, keep information such as batch, semester, etc.).
- Modify numeric values logically (e.g., even ↔ odd semester).
- If the query **already includes timeframes**, generate an alternative variation **without altering the intended year**.
- **Avoid redundant transformations** (e.g., simple word reordering).
- **Maintain the original query's intent**.
- **Use both full form and abbreviation** for the same term if abbreviation is used in the original query.
- **Add session or year** if not provided directly in the query, if query asks for a document that is temporally relevant but do not go into future.
- **Do NOT use placeholders in the query** keep them so they are easy to search for a vector search
---

### ** Guidelines for Specificity Score (`specificity`)**
- Assign a **float value between `0.0` and `1.0`** to indicate **how specific or broad** the original query is.
- Use the following reference scale:
  - **`1.0` → Very specific** (e.g., `"Where did student "X" get placed?`)
  - **`0.5` → Moderately specific** (e.g., `"What are the placement trends for CSE for year 2024?"`)
  - **`0.0` → Very broad** (e.g., `"Tell me about placements at NSUT?"`, `"give me list of detained students"`)
- The **specificity score should be based only on the original query** (not on the expanded queries).

---

### ** Guidelines for Keyword Extraction**
- Identify **unique identifiers** to enhance retrieval precision.
- Only extract keywords that are **critical for retrieving relevant results**.
  - **Positive examples:** `"roll number"`, `"event name"`, `"semester"`, `"academic year"`, `"2nd semester"`.
  - **Negative examples:** Generic terms like `"NSUT"`, `"students"`, `"policy"`, `"fees"`, `"semester"``.
- **If no specific keywords are found, return an empty list**.

---

### ** JSON Output Format (Strict)**
Ensure the output is a **valid JSON object**, structured as follows:

```json
{{
    "queries": ["Refined Query 1", "Refined Query 2"],
    "keywords": ["keyword1", "keyword2"],
    "specificity": float  // Ranges from 0.0 to 1.0
}}

example:
given query: "5th semester result for Sarthak sharma in csda"
{{
    "queries": [
        "5th semester result for Sarthak Sharma in CSDA 2025",     
        "Official Gazette Report for 5th Semester CSDA"
    ],
    "keywords": [
        "5th semester",
        "Sarthak Sharma",
        "CSDA"
    ],
    "specificity": 0.7
}}
"""