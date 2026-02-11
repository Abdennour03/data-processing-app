# Import Libraries to upload data with FastAPI
from fastapi import UploadFile, File, HTTPException
import shutil
import os
from backend.config import UPLOAD_DIR, NORMAL_DATA_DIR, CLUSTRED_DATA_DIR


async def upload_file_controller(file: UploadFile = File(...), places_folder : str = "normal"):
    LIMIT = 30 * 1024 * 1024
    filename = os.path.basename(file.filename)

    if not filename.lower().endswith((".csv", ".xlsx", ".json")):
        raise HTTPException(status_code=400, detail="Invalid file type")

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > LIMIT:
        raise HTTPException(status_code=413, detail="File too large")

    # We map the string from the user to the Path objects in your config
    if places_folder == "clustering":
        target_dir = CLUSTRED_DATA_DIR
    else:
        target_dir =   NORMAL_DATA_DIR

    target_dir.mkdir(parents=True, exist_ok=True)
    file_location = target_dir / file.filename

    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    return {"message": "File uploaded successfully!", 
            "filename": filename,
            "floder": places_folder,
            "path": str(file_location)
            }




from backend.utils.EDAprocessing import perform_eda 

async def get_eda_controller(filename: str, places_folder: str):
    # 1. Validation (Controller's job)
    if not filename.endswith('.csv'):
        return {"error": "Only CSV files are supported for EDA currently"}

    # 2. Call the Utility (The "Muscle")
    stats = perform_eda(filename, places_folder)

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