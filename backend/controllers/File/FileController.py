# Import Libraries to upload data with FastAPI
from fastapi import UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import shutil
import os
from backend.config import UPLOAD_DIR, NORMAL_DATA_DIR, CLUSTRED_DATA_DIR
from backend.config import PROCESSED_DATA_DIR
import pandas as pd
import numpy as np

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
    if isinstance(result, dict) and result.get("error"):
        return result

    return {
        "status": "success",
        "message": f"File {filename} hase been cleaned and saved.",
        "details": result,
        "missing_values_comparison": result.get("missing_values_comparison"),
        "raw_data_preview": result.get("raw_data_preview"),
        "cleaned_data_preview": result.get("cleaned_data_preview")
    }

async def download_file_controller(filename: str):
    file_path = PROCESSED_DATA_DIR / f"cleaned_{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code = 404,
            detail = f"File cleaned_{filename} not found. Please clean the data first."
        )
    return FileResponse(
        path=file_path,
        filename=f"cleaned_{filename}",
        media_type='text/csv' 
    )


async def get_custom_plot_logic(filename: str, x: str, y: str, folder: str):
    import json
    try:
        # Raw file path
        if folder == "clustering":
            raw_path = CLUSTRED_DATA_DIR / filename
        else:
            raw_path = NORMAL_DATA_DIR / filename
        cleaned_path = PROCESSED_DATA_DIR / f"cleaned_{filename}"

        # Read both
        raw_df = pd.read_csv(raw_path) if os.path.exists(raw_path) else None
        cleaned_df = pd.read_csv(cleaned_path) if os.path.exists(cleaned_path) else None

        def prep(df):
            if df is None:
                return []
            # Explicitly convert selected columns to float
            for col in [x, y]:
                df[col] = pd.to_numeric(df[col], errors='coerce').astype(float)
            df = df[[x, y]].dropna(subset=[x, y])
            # Sample for performance
            if len(df) > 1000:
                df = df.sample(n=1000, random_state=42)
            return df.to_dict(orient='records')

        def outlier_count(df):
            if df is None:
                return 0
            if x not in df.columns or y not in df.columns:
                return 0
            numeric_cols = [col for col in [x, y] if pd.api.types.is_numeric_dtype(df[col])]
            outliers = 0
            for col in numeric_cols:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - 1.5 * IQR
                upper = Q3 + 1.5 * IQR
                outliers += int(((df[col] < lower) | (df[col] > upper)).sum())
            return outliers

        response = {
            "raw_data": prep(raw_df),
            "cleaned_data": prep(cleaned_df),
            "raw_outliers": outlier_count(raw_df),
            "cleaned_outliers": outlier_count(cleaned_df)
        }
        # Ensure proper JSON response
        return json.loads(json.dumps(response))
    except Exception as e:
        print(f"DEBUG ERROR: {str(e)}")
        return {"error": str(e)}

