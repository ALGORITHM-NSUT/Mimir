Context_sufficient_prompt = """Context Sufficiency Evaluation Prompt:

                  Assess whether the provided context adequately addresses the query: "{question}".

                  The goal is not to directly answer the question but to determine whether the context is relevant and sufficient.
                  Pay close attention to the following keywords: {keywords}.
                  Strictly base your evaluation on the given context—do not make assumptions or infer information beyond what is explicitly stated.
                  Only respond "YES" if the context fully supports answering the question with confidence. Respond "NO" only if you are absolutely certain that the context is insufficient.
                  Context for evaluation:
                  {context}

                  Current date: {current_date}

                  Your response must be only "YES" or "NO"—no additional text or explanations.
"""