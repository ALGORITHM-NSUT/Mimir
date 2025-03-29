Query_expansion_prompt = """Given the following query: "{query}" and the current date "{current_date}" (for reference in this session), your task is to create an **action plan** to retrieve information step by step, based on your system knowledge of where different types of data are stored.  

🚨 **STRICT RULES TO FOLLOW:**  
1. **DO NOT** go beyond what user has asked, stay limited to the query scope. make simple queries dont go too complex.
2. **Break down the query into logical steps.** 
    -Try to do in as little steps as possible without making complex queries.
    -Breakdown in such a way that steps are dependant on information from each other. for information that does not require data from anywhere else, don't make it a separate sequential step. all such information can be included in the first step.
3. **Each step consists of at least one specific query (no maximum limit).**  
4. **For "AND" queries (multiple pieces of information needed), create multiple specific queries per step.**  
5. **Determine if specific queries can be resolved using document-level searches or require direct retrieval.**  
6. **An action plan can have a minimum of 1 step and a maximum of 3 steps.**  
7. **If required, use previously known user knowledge to refine queries.**  
8. **Before making queries, think very carefully about the timeline, what date is today, what date is the query asking for, and what date documents are typically released to determine accurately what documents you would have in the database and reason correctly.**
9. **If user mentions past, think how much documents would have been released after it**
10. **ALWAYS Use both full form and abbreviation in both document queries and specific queries in every single query, no need to make multiple queries just to have both abbrevation and full form** if given.
11. **Make as minimum and contextually unique document queries as possible, no 2 document queries should retreive similar type of data, they should NOT just be rewords of each other**.
12. **NEVER assume year unless stated or is very clear by the kind of query user asks, do not use wordings like 2023-2024, ONLY use 2023 or 2024**, for year assumption use your system knowledge, odd semester cannot be on-going in jan to july, even sem in aug to dec.
13. **DO NOT add nsut or netaji subhas university of technology in queries, all documents are from the same university, so it is not required**.
---

## **📌 Action Plan Structure**
- **Each step must have at least one "specific query."**  
- **Do not make unnecessary steps that go beyond user query**
- **Document queries should be contextually unique as in what kind of data they fetch for a step not be too generic, they should still contain semester(if given), timeframe(if given, otherwise assume current latest period when this information could've been released), department(if given) etc**, try to make document level queries informative but dont assume
- **"Document queries" can be 0 or more per step. DO NOT make more than required. DO NOT make Document queries that are very similar to each other, keep them minimum in number and unique** 
    -High amount of document queries hampers the speed of the system which is crucial.
- **0 Document queries are for cases when you want a broad unfocused search, it gives variety of data but maybe inaccurate to the specific query** (use it only in case you don't know what documents to search in or you want to search in wide variety of docuuments at once)
- NEVER make document_queries like: 'Official Notices & Circulars 2025' because all documents will for this criteria and no filtering will be possible
- **Each specific query must have a specificity score (`0.0 - 1.0`) and expansivity score (`0.0 - 1.0`)**  
- **Ensure the action plan is structured for efficient retrieval.**
- **DO NOT include a step that does not require more data retreival, if a step can be resolved with the information already known, it should be removed.**
- **If no specific year given, use the current year as a default. unless according to docuemnt release timelines from system information, that document wouldnt have been released**
---

## **📌 Guidelines for Query Expansion**
- Generate **specific queries** to retrieve data step-by-step.  
- **Split** queries that ask for more than one data into sub-queries, dont make queries that ask for multiple data in 1 query, use of comma or and is not allowed unless it is used a filter for logical and for a single query.
- **Ensure meaningful variation**:
  - Queries should be **precise and retrieval-ready** (e.g., add batch, semester, department, roll number if available).  
  - **Modify numeric values logically** (e.g., even ↔ odd semester if applicable).  
  - If timeframe is missing, **infer a reasonable session** (but never predict future years).  
- **ALWAYS Use both full form and abbreviation in both document queries and specific queries in every single query, no need to make multiple queries just to have both abbrevation and full form** if given.  
- **Maintain original query intent**—no unnecessary generalization. 
- **Both Document and specific queries should be sufficiently unique
- **Specific queries should be as specific as possible based on type of data required, they should contain batch, semester, department, roll number etc if available, for data that depends on it, for common data that does not depend on such fields as per knowledge given to you below, it is not required**.
- **In each specific query if there is a name, always provide that full name in double quotes**. 
- **whenever asking for roll number check for result of PREVIOUS semester for only specific branch given, unless asked data is of previous year then search for current result**
---

## **📌 Guidelines for Specificity Score (`specificity`)**
- Assign a **float value between `0.0` and `1.0`** to indicate how specific the original query is.  
- This specificity score will be used to set text search weightage over vector search weightage, high specificity score means more weightage to text search.
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

### **🔹Special instruction**
- For any information gathered through academic calendar as a document query, 
    - **Always use the latest available academic calendar** unless otherwise specified.
    - one of the specific query should target the entire academic calendar, and the rest of the specific queries should target specific information from the calendar.
    - add 1 extra document query directed at that particular information revision seperate from academic calendar *DO NOT make a seperate step for this, just add it as a document query in the same step.

## **📌 JSON Output Format (STRICT)**
```json
{{
    "action_plan": [
        {{
            "step": 1,
            "reason": "Explain why this step is needed",
            "specific_queries": [
                {{
                    "query": "Unique Specific Query 1",
                    "specificity": float,
                    "expansivity": float
                }}
            ],
            "document_queries": [
                "Unique Document-Level Query 1"
            ]
        }}
    ]
}}
IN ANY CASE YOU MUST NOT DEVIATE FROM THIS ANSWER FORMAT

📌 Rules:
**At least one "specific query" per step each should be very unqiue do not make more than required but no max limit, without specific queries NO DATA will be returned.**
**"Document queries" can be 0 or more per step. DO NOT make more than required. DO not make Document queries that are very similar to each other, keep them MINIMUM in number and only unique queries targetting different fields of documents**
If multiple peices of information do not depend upon each other, they can be inquired in one step. different document queries can be inquired in the same step.
Only generate multiple steps if answer of 1 step will be used to get enough data for next step
Document_queries list can contain more tha 1 type of unrelated documents, try your best to reduce steps while increasing subqueries
try to make a step to get full forms of ambiguos data.
if data gathering by document query is ambiguos and may or may not depend upon previous data, you may create an (optional step) for it and mention it in the reason.
Ensure JSON is well-formed.


here is some extra knowledge for augment and rewrite queries:
ACADEMIC RECORDS:
- Student Results & Transcripts (called gazzette reports in in title)
- Detained Attendance Records
- Course Registrations
- Curriculum & Syllabus Data(valid for 6 months)
- Time tables branch-wise and semester-wise (contains course titles(either in name format or codes) and may or may not contain respective teacher, released in proximity of 1 month before semester starts)
- course coordination comittee (CCC) (per semester document with full information of course codes mapped to course names and teacher name) 

ADMINISTRATIVE DOCUMENTS:
- Official Notices & Circulars
- Academic Calendar (common for all)
    -valid for 6 months, released every 6 months, twice an year does not relate to previous semester or previous year, 
    -contains information about release of documents, results, activities etc within a semester and their timeline, 
    -it is common for all branches and all semesters
- Admission Records
- Fee Structure
- Scholarship Information
- NPTEL courses
- NPTEL exam results
- Administrative Policies
- Disciplinary Records (Suspension/Fines/Penalties)
- Official Gazette Reports (contains student results, if roll number of a student is wanted their any semester result, result of student with name and roll number is stored together)
- Meeting Minutes
- University Ordinances
- Seating plans for students (only uses student roll numbers instead of names)

CAMPUS INFORMATION: 
- Main Campus: 
    BBA, 
    BFtech, 
    B.Tech:
        CSE(computer sceince engineering),
        CSAI(artifical intelligence), 
        CSDS(data science), 
        MAC(mathematics and computing), 
        Bio-Technology, 
        ECE-IOT(internet of things),
        ECE(electronics and communication engineering), 
        EE(electrical engineering), 
        ICE(instrumentation and control), 
        IT(information technology), 
        ITNS(information technology with network security),  
        ME(Mechanical Engineering)

- East Campus:
    B.Tech:
        CSDA(**Big** Data Analytics), (The B is not present in the full form, it is strictly NOT just data analytics) 
        ECAM(artificial intelligence and machine learning), 
        CIOT(Internet of things).  

- West Campus: 
    B.Tech:
        ME(Mechanical Engineering),
        MPAE(Manufacturing Process and Automation Engineering),
        MEEV(Electric Vehicles), 
        Civil Engineering, 
        GeoInformatics.

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
• Roll no is present in alphanumeric characters like 2024UCI6090 here the first 4 character represent the year of admission the next 3 character represent the branch code and last 4 character represents the unique number.
• Exam protocols, seating arrangements, result declaration timelines, and academic calendars.
• each even semseter starts january, odd starts july
• 2 semesters in an academic year, semester starting from january and july come under current year and next year documents (example if today is 2023 year and a document for even semester will be released with name 2023 NOT 2022-2023, assume forward year unless specifically asked for backward years)
• there is also a summer semester every year, where backlogs and improvement courses are run
• timetables and academic calendars are released 1 month to few weeks prior to the start of the semester (may be reivsed later)
• 2 internal CT, 1 midsem, 1 endsem, 1 endsem-practical exam
• 1 internal exam for practical subjects (e.g. physics, chemistry, biology)
• end semester result is released 1 month after exam (also called gazzete reports)
• end semester result is released 1 month after exam (also called gazzete reports)
• student welfare and other documents can be released whenever
• seating arrangements and exact datesheet for exams(both theoretical and practical) are relased a week before exams, tentative dates are released with academic calendar
• Your Knowledge cutoff is 1 jan 2024, you do not have knowledge of documents before that
• Suspension is different from detainment, a student is detained when the have lower than 75%' attendance, suspension is when a student is involved in misconduct/violence and other suuch behaviours


### *Query Augmentation*
You can use information from this knowledge to augment and enrich the query, add as much as you can from this knowledge to query
You can also use this knowledge to determine next steps

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
                    "expansivity": 0.9
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
                    "expansivity": 0.5
                }}
            ],
            "document_queries": [
                "Official Notices & Circulars for considering Diwali 2025",
            ]
        }}
    ]
}}
📌 Reasoning Explanation:
Step 1: First, search the Academic Calendar for all listed holidays.
Step 2: If Diwali isn't explicitly listed, verify with notices or circulars.

📌 Example 2: Query for Seating Arrangement of Students
🔍 Query: "were rohit singla and rajeev chauhan seated together in same room for 6th sem midsem exams? they are in csda"

✅ Generated Action Plan:
{{
  'action_plan': [
    {{
      'step': 1,
      'reason': 'since User did not provide roll number like (2023UCS6654), to find the seating arrangement, we need the roll numbers of the students. Since the user is asking for the midsem exam seating arrangement for the 6th semester, and the current date is March 25, 2025, the 6th semester is ongoing. Therefore, the 5th-semester results are the most recent available to retrieve the roll numbers.',
      'specific_queries': [
        {{
          'query': 'Find the 5th semester result of "rohit singla" in Computer Science and Big Data Analytics (CSDA) branch',
          'specificity': 0.9,
          'expansivity': 0.4,
        }},
        {{
          'query': 'Find the 5th semester result of "rajeev chauhan" in Computer Science and Big Data Analytics (CSDA) branch',
          'specificity': 0.9,
          'expansivity': 0.4
        }}
      ],
      'document_queries': [
        'Official Gazette Report for 5th semester East Campus Computer Science and Data Analytics (CSDA) branch'
      ]
    }},
    {{
      'step': 2,
      'reason': "Now that we have the roll numbers of both students, we can find their seating arrangement for the 6th-semester midsem exams. Since the query is for midsem exams, and the current date is March 25, 2025, it's likely that the seating arrangement has been released.",
      'specific_queries': [
        {{
          'query': 'Seating arrangement for "rohit singla" (roll number X) for 6th semester midsem exams in Computer Science and Big Data Analytics (CSDA) branch',
          'specificity': 0.95,
          'expansivity': 0.6
        }},
        {{
          'query': 'Seating arrangement for "rajeev chauhan" (roll number Y) for 6th semester midsem exams in Computer Science and Big Data Analytics (CSDA) branch',
          'specificity': 0.95,
          'expansivity': 0.6
        }}
      ],
      'document_queries': [
        'Seating plan for 6th semester midsem exams for Computer Science and Big Data Analytics (CSDA) branch'
      ]
    }}
  ]
}}
📌 Reasoning Explanation:
Step 1: Retrieve the student’s roll number because it was not given from their semester result (Gazette Report).
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
                    "expansivity": 0.7
                }},
                {{
                    "query": "Summer semester start date for 2025 at NSUT",
                    "specificity": 0.6,
                    "expansivity": 0.3
                }},
                {{
                    "query": "academic caldendar 2025",
                    "specificity": 0.3,
                    "expansivity": 0.8
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
                    "query": "student "X" semester 2 branch Y result 2025",
                    "specificity": 0.6,
                    "expansivity": 0.4
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
✔ You CANNOT ask for documents that may not have been released by now for any verfication, pay attention
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