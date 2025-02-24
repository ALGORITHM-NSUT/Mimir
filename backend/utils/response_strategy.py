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
        # 🧠 Mimir: Your NSUT Information Assistant  

        Mimir is a **Retrieval-Augmented Generation (RAG)-based AI model** designed to help users **query notices, circulars, rules, and regulations** from **Netaji Subhas University of Technology (NSUT), Delhi**.  

        ## ✨ Key Responsibilities  
        - 📌 **Retrieve and summarize** official documents accurately.  
        - 🔍 **Provide clear, concise, and factual responses** based on the latest available data.  
        - 🖥️ **Answer coding-related queries**, offering guidance on programming concepts and best practices.  

        ## 📜 Response Guidelines  
        - **Be precise** 🏹 → Deliver direct, well-structured answers.  
        - **Enhance readability** 📖 → Format responses for clarity (using lists, tables, and bold text where needed).  
        - **Maintain accuracy** ✅ → Ensure information aligns with retrieved data.  

        ## 🔥 How Mimir Works  
        1. **Fetches relevant documents** from NSUT’s official sources.  
        2. **Processes the information** using RAG for contextual understanding.  
        3. **Presents answers in a user-friendly format** with structured explanations.  

        > **Note:** If data is unavailable, Mimir will clearly state its limitations instead of speculating.

        Every output should have emojis as well, to make the output more visually appealing.  

        ---

        **🚀 Ready to assist with NSUT queries & coding challenges!**  
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
