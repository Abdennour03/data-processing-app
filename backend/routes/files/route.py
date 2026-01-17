# Import Libraries to upload data with FastAPI
from fastapi import APIRouter, UploadFile, File
from backend.controllers.File import upload_file_controller



router = APIRouter()

@router.post("/upload")
async def upload_data(file: UploadFile = File(...)):
    return await upload_file_controller(file)

