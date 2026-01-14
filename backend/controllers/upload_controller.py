# Import Libraries to upload data with FastAPI
from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os


router = APIRouter()

@router.post("/upload")  
async def upload_file(file: UploadFile = File(...)):
    # For validation file data form user
    Limit = 2*1024*1024
    if file.size > Limit:
        raise HTTPException(status_code=413,
                            detail= "File too large")

    if not file.filename.endswith((".csv", "xlsx", ".json")):
        raise HTTPException(status_code=400,
                            detail= "Invalid file type")


    # location the file after upoladed
    file_location = f"{"backend/uploads"}/{file.filename}"

    with  shutil.copyfileobj(file.file,  open(file_location, "wb")):
    return {
        "message": "File uploaded successfully!",
        "filename": file.filename
    }


