# Import Libraries to upload data with FastAPI
from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os

async def upload_file_controller(file: UploadFile = File(...)):
    LIMIT = 2 * 1024 * 1024
    filename = os.path.basename(file.filename)

    if not filename.lower().endswith((".csv", ".xlsx", ".json")):
        raise HTTPException(status_code=400, detail="Invalid file type")

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > LIMIT:
        raise HTTPException(status_code=413, detail="File too large")

    upload_dir = os.path.join("backend", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_location = os.path.join(upload_dir, filename)

    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    return {"message": "File uploaded successfully!", "filename": filename}