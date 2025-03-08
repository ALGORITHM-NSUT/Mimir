Context_sufficient_prompt = """Evaluate if this context fully answers '{question}':
                keep in mind direct question answering is not the goal here, but rather to evaluate the context's relevance and sufficiency
                pay attention to these keywords: {keywords}
                
                it is very crucial to answer this question with the highest accuracy possible, do not make any assumptions, only use the information provided in the context.
                only say NO if you are very very sure
                Answer ONLY 'YES' or 'NO':
                DO NOT OUTPUT ANYTHING ELSE BESIDES 'YES' or 'NO'

                pay very close attention to the context, you must not miss any information:
                {context} 

                considering today is {current_date}
                """