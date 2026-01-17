from fastapi import FastAPI
import uvicorn
from backend.routes.files.route import router as upload_router

app = FastAPI(title="Data Processing API")

app.include_router(upload_router, prefix="/files", tags=["Files"])

@app.get("/")
def read_root():
    return {"status": "Backend is running"}
    
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)