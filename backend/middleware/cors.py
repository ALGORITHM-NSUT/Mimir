from fastapi.middleware.cors import CORSMiddleware

allowedorigins = ["https://mimir-frontend-eight.vercel.app", "http://localhost:5173"]


def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins= allowedorigins,  
        allow_credentials=True,
        allow_methods=["*"],  
        allow_headers=["*"],  
    )
    


