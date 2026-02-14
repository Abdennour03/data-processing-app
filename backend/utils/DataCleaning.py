import pandas as pd
import os
import numpy as np
from backend.config import PROCESSED_DATA_DIR, UPLOAD_DIR, NORMAL_DATA_DIR, CLUSTRED_DATA_DIR

def clean_and_cave_data(filename: str, places_folder: str = f"normal"):
    
    if places_folder == "clustering":
        input_path = CLUSTRED_DATA_DIR / filename
    else:
        input_path = NORMAL_DATA_DIR / filename

    output_folder = PROCESSED_DATA_DIR

    if not output_folder.exists():
        output_folder.mkdir(parents=True, exist_ok=True)

    output_path = output_folder / f"cleaned_{filename}"
    if not input_path.exists():
        return {"error": f"Original file not found at {input_path}"}

    try:
        # Load original data
        df_raw = pd.read_csv(input_path, sep=None, engine="python", decimal=',')
        initial_rows_count = len(df_raw)
        missing_before = int(df_raw.isna().sum().sum())

        # Copy for cleaning
        df = df_raw.copy()
        # 1. Missing Values
        cols_to_drop = []
        for col in df.columns:
            if "id" in col.lower() or df[col].nunique() == len(df):
                cols_to_drop.append(col)
        df.drop(columns=cols_to_drop, inplace=True, errors='ignore')
        for col in df.columns:
            if df[col].dtype in ['int64', 'float64']:
                df[col] = df[col].fillna(df[col].mean())
            else:
                mode_val = df[col].mode()
                df[col] = df[col].fillna(mode_val[0] if not mode_val.empty else "Missing")

        # 2. Outliers (IQR)
        numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns
        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]

        # 3. MinMax Scaling for numeric columns (manual, no sklearn)
        if len(numeric_cols) > 0:
            for col in numeric_cols:
                min_val = df[col].min()
                max_val = df[col].max()
                if max_val != min_val:
                    df[col] = (df[col] - min_val) / (max_val - min_val)
                else:
                    df[col] = 0.0
            # After scaling, ensure all numeric columns are float, finite, and rounded
            for col in numeric_cols:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                df[col] = df[col].replace([np.inf, -np.inf, np.nan], 0.0)
                df[col] = df[col].round(6).astype(float)

        for col in df.select_dtypes(include=['object', 'category']).columns:
            df[col] = df[col].astype('category').cat.codes
            df[col] = df[col].replace(-1, 0)

        # 4. Remove constant columns
        for col in df.columns:
            if df[col].nunique() <= 1:
                df.drop(col, axis=1, inplace=True)

        # This is the "Magic Fix" for the PCA Math Error
        df = df.apply(pd.to_numeric, errors='coerce').fillna(0)
        missing_after = int(df.isna().sum().sum())
        final_rows_count = len(df)
        rows_removed = initial_rows_count - final_rows_count
        # Save the new version
        df.to_csv(output_path, index=False)
    
        return {
            "status": "success", 
            "cleaned_file": f"cleaned_{filename}",
            "initial_rows": initial_rows_count,
            "final_rows": final_rows_count,
            "rows_removed": rows_removed,
            "removed_columns_count": len(cols_to_drop),
            "removed_columns_list": cols_to_drop,
                "missing_values_comparison": {"raw": missing_before, "cleaned": missing_after},
                "raw_data_preview": df_raw.head(200).to_dict(orient="records"),
                "cleaned_data_preview": df.head(200).to_dict(orient="records"),
            "message": f"Successfully removed {len(cols_to_drop)} non-informative columns (IDs/Constants).",
            "path": str(output_path)
        }
    except Exception as e:
        return {"error": f"Cleaning Error: {str(e)}"}