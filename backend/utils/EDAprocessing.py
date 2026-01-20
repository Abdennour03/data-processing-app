import pandas as pd
import numpy as np
import matplotlib as pl
import multipart
import os


def perform_eda(filename: str):
    # 1. Get the absolute path of the current file (EdaProcessing.py)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 
    
    # 2. Join it to reach the uploads folder
    file_path = os.path.join(base_dir, "uploads", filename)
    
    # Debug print: This will show up in your terminal so you can see where it's looking
    print(f"DEBUG: Looking for file at: {file_path}")

    if not os.path.exists(file_path):
        return {"error": f"File not found at {file_path}"}

    try:
        df = pd.read_csv(file_path, sep=None, engine='python', decimal=',') 

        return {
            "columns": df.columns.tolist(),
            "rows": len(df),
            "summary": df.describe().fillna("").to_dict(),
            "data_types": df.dtypes.astype(str).to_dict()
        }
    except Exception as e:
        return {"error": str(e)}

