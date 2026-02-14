from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from backend.routes.files.route import router as upload_router

app = FastAPI(title="Data Processing API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    # غانزيدو 5174 و 5175 حيت Vite كيبدلهم إيلا كان البور خدام
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5174",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api/files", tags=["Files"])

@app.get("/")
def read_root():
    return {"status": "Backend is running"}
    
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)