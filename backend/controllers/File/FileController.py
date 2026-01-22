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

    upload_dir = os.path.join("..", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_location = os.path.join(upload_dir, filename)

    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    return {"message": "File uploaded successfully!", "filename": filename}




from backend.utils.EDAprocessing import perform_eda 

async def get_eda_controller(filename: str):
    # 1. Validation (Controller's job)
    if not filename.endswith('.csv'):
        return {"error": "Only CSV files are supported for EDA currently"}

    # 2. Call the Utility (The "Muscle")
    stats = perform_eda(filename)

    # 3. Format the response (Controller's job)
    return {
        "status": "success",
        "data": stats
    }



from backend.utils.PCAprocessing import perform_pca
async def get_pca_controller(filename: str, n_components: int):
    
    # 2. Call the Utility (The "Muscle")
    result = perform_pca(filename, n_components)
    
    if n_components <= 0:
        return {"error": "Number of components must be greater than 0"}
    return result


from backend.utils.DataCleaning import clean_and_cave_data

async def get_cleaning_controller(filename: str):
    if not filename.endswith(".csv"):
        return {"errore": "Only CSV files can be cleaned currently"}

    result = clean_and_cave_data(filename)
    return {
        "status": "success",
        "message": f"File {filename} hase been cleaned and saved.",
        "details": result
    }