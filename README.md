## **Mimir - Query Platform for NSUT Notices & Circulars**

#### **Mimir is a platform that answers user queries related to NSUT notices, circulars, and rules and regulations. It scrapes files from websites and provides responses using natural language, leveraging Retrieval-Augmented Generation (RAG).** 
---

## **Installation & Setup**

### **1. Clone the Repository**
```sh
git clone https://github.com/ALGORITHM-NSUT/Mimir
cd mimir
```

### **2. Environment Setup**
Ensure that you create **`.env`** files in both the **`frontend`** and **`backend`** directories.

#### **Frontend `.env` (in `frontend/` directory)**
```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

#### **Backend `.env` (in `backend/` directory)**
```env
MONGO_URI= your-mongodb-uri
FRONTEND_URL=http://localhost:5173
GOOGLE_API_KEY=your-google-api-key
SECRET_KEY=can-be-anything
```

---

## **Running the Project**

### **1. Start the Backend (FastAPI)**
```sh
cd backend
python -m venv .venv
On Windows use `.venv\Scripts\Activate.ps1`
pip install -r requirements.txt
fastapi dev 
```

### **2. Start the Frontend (React + Vite)**
```sh
cd frontend
npm install
npm run dev
```

---

