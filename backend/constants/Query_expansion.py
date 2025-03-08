Query_expansion_prompt = """given this query: {query} and current date {current_date} (reference for current session)
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
                "queries": [List of search variations, each as a string],
                "keywords": [List of relevant keywords]
                }}


                Ensure the output is a valid JSON file and contains only the requested JSON structure.
                """