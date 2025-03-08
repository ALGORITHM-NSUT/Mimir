Query_refine_prompt = """
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

                current date: {current_date} (reference for current session)"""