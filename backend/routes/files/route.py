# Import Libraries to upload data with FastAPI
from fastapi import APIRouter, UploadFile, File
from backend.controllers.File import upload_file_controller, get_eda_controller, get_pca_controller, get_cleaning_controller


router = APIRouter()

@router.post("/upload")
async def upload_data(file: UploadFile = File(...)):
    return await upload_file_controller(file)

@router.get("/eda/{filename}")
async def get_eda(filename: str):
    return await get_eda_controller(filename)


@router.get("/pca/{filename}")
async def get_pca(filename: str, n: int =2):
    return await get_pca_controller(filename, n_components=n)

@router.get("/cleane/{filename}")   
async def clean_data(filename: str):
    return await get_cleaning_controller(filename)   