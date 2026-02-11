import pandas as pd
import numpy as np 
import os
from backend.config import  CLUSTRED_DATA_DIR, NORMAL_DATA_DIR

def perform_eda(filename: str, places_folder: str):

    # 1. Use the absolute path from your config
    if places_folder == "clustering":
        file_path = CLUSTRED_DATA_DIR / filename
    elif places_folder == "normal":
        file_path = NORMAL_DATA_DIR / filename
    else:
        return {"error": f"Invalid folder type: {places_folder}"}
    # Check if path exists
    if not os.path.exists(file_path):
        return {"error": f"File not found at {file_path}"}

    try:
        df = pd.read_csv(file_path, sep=None, engine='python', decimal=',')
        eda_results = {
            "info": {
                "total_rows": len(df),
                "total_columns": len(df.columns)
            },
            "columns_analysis": {}
        }
        

        for col in df.columns:
            column_data = {}
            is_numeric_type = df[col].dtype in ['int64', 'float64']
            is_probably_id = "id" in col.lower() or df[col].nunique() == len(df)

            if is_numeric_type and not is_probably_id:
                column_data["type"] = "numeric"
                column_data["stats"] = df[col].describe().to_dict()
            else:
                column_data["type"] = "categorical"
                column_data["unique_count"] = int(df[col].nunique())
                if df[col].nunique() > 50: 
                    column_data["value_counts"] = "Too many unique values to display"
                else:
                    column_data["value_counts"] = df[col].value_counts().to_dict()

            eda_results["columns_analysis"][col] = column_data
        return eda_results

    except Exception as e:
        return {"error": str(e)}









