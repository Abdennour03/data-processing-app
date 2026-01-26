import pandas as pd
import numpy as np 
import os
from backend.config import UPLOAD_DIR

def perform_eda(filename: str):

    # 1. Use the absolute path from your config
    file_path = UPLOAD_DIR / filename
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
            if df[col].dtype in ['int64', 'float64']:
                column_data["type"] = "numeric"
                column_data["stats"] = df[col].describe().to_dict()

            else:
                column_data["type"] = "categorical"
                column_data["stats"] = df[col].nunique()
                column_data["value_counts"] = df[col].value_counts().to_dict()

            eda_results["columns_analysis"][col] = column_data
        return eda_results

    except Exception as e:
        return {"error": str(e)}









