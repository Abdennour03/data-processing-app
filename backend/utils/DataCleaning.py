import pandas as pd
import os
import numpy as np
from backend.config import PROCESSED_DATA_DIR, UPLOAD_DIR

def clean_and_cave_data(filename: str):
    input_path = UPLOAD_DIR / filename
    output_folder = PROCESSED_DATA_DIR

    if not output_folder.exists():
        output_folder.mkdir(parents=True, exist_ok=True)

    output_path = output_folder / f"cleaned_{filename}"
    if not input_path.exists():
        return {"error": f"Original file not found at {input_path}"}

    try:
        # Load data
        df = pd.read_csv(input_path, sep=None, engine="python", decimal=',')
        
        # 1. Missing Values
        for col in df.columns:
            if df[col].dtype in ['int64', 'float64']:
                df[col] = df[col].fillna(df[col].mean())
            else:
                # Add a check to ensure mode isn't empty
                mode_val = df[col].mode()
                df[col] = df[col].fillna(mode_val[0] if not mode_val.empty else "Missing")

        # 2. Outliers (IQR)
        # 
        numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns
        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]

        
        for col in df.select_dtypes(include=['object', 'category']).columns:
            df[col] = df[col].astype('category').cat.codes
            # Replace -1 (pandas error code for NaNs in cat codes) with 0
            df[col] = df[col].replace(-1, 0)

        # 4. Remove constant columns (Standardization fails if std is 0)
        for col in df.columns:
            if df[col].nunique() <= 1:
                df.drop(col, axis=1, inplace=True)

        # This is the "Magic Fix" for the PCA Math Error
        df = df.apply(pd.to_numeric, errors='coerce').fillna(0)

        # Save the new version
        df.to_csv(output_path, index=False)
    
        return {
            "status": "success", 
            "cleaned_file": f"cleaned_{filename}",
            "row_after_outliers": len(df)
        }
    except Exception as e:
        return {"error": f"Cleaning Error: {str(e)}"}