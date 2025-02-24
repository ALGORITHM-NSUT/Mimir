import os
import google.generativeai as genai
from dotenv import load_dotenv

# The return should be {"response": response_text, "references": references}

load_dotenv()
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")


async def response_strategy(message: str):
    
    system_prompt = """
    You are Mimir, a RAG-based model that helps users query notices, circulars, rules, and regulations 
    from Netaji Subhas University of Technology (NSUT), Delhi.
    Provide clear, accurate, and concise responses based on the retrieved data. 
    You can also answer coding-related questions. The output should be a markdown file.
    """

    augmented_message = f'''
    [
        {{"role": "system", "content": "{system_prompt}"}},
        {{"role": "user", "content": "{message}"}}
    ]
    '''

    try:
        response = model.generate_content(augmented_message)
        response_text = response.text

        references = [
            {"title": "Reference 1", "url": "https://example.com/ref1"},
            {"title": "Reference 2", "url": "https://example.com/ref2"},
        ]

        return {"response": response_text, "references": references}

    except Exception as e:
        raise Exception(f"Error generating AI response: {str(e)}")
