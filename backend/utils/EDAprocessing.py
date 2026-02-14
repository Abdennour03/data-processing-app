import pandas as pd
import numpy as np 
import os
from backend.config import  CLUSTRED_DATA_DIR, NORMAL_DATA_DIR
from sklearn.decomposition import PCA

def perform_eda(filename: str, places_folder: str, n_components: int = 2):

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
            "columns_analysis": {},
            "visualizations": {
                "box_plots": [],
                "correlation": None
            },
            "explained_variance": None
        }
        
        numeric_cols = []
        for col in df.columns:
            column_data = {}
            is_numeric_type = df[col].dtype in ['int64', 'float64']
            is_probably_id = "id" in col.lower() or df[col].nunique() == len(df)

            if is_numeric_type and not is_probably_id:
                numeric_cols.append(col)
                column_data["type"] = "numeric"
                column_data["stats"] = df[col].describe().to_dict()
                eda_results["visualizations"]["box_plots"].append({
                    "column": col,
                    "y": df[col].dropna().tolist()
                })
            else:
                column_data["type"] = "categorical"
                column_data["unique_count"] = int(df[col].nunique())
                if df[col].nunique() > 50: 
                    column_data["value_counts"] = "Too many unique values to display"
                else:
                    column_data["value_counts"] = df[col].value_counts().to_dict()

            eda_results["columns_analysis"][col] = column_data

        # PCA explained variance using sklearn after manual standardization
        if len(numeric_cols) >= n_components:
            X = df[numeric_cols].to_numpy(dtype=np.float64)
            # Clean numeric data for PCA: replace NaN/Inf
            X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
            # Manual standardization
            mean = np.mean(X, axis=0)
            std = np.std(X, axis=0)
            std = np.where(std == 0, 1.0, std)
            X_std = (X - mean) / std
            pca = PCA(n_components=n_components)
            X_pca = pca.fit_transform(X_std)
            explained_variance = [round(float(v) * 100, 2) for v in pca.explained_variance_ratio_]
            # Clean pca_results for frontend (no NaN/Inf)
            pca_results = np.nan_to_num(X_pca, nan=0.0, posinf=0.0, neginf=0.0).tolist()
            eda_results["explained_variance"] = explained_variance
            eda_results["pca_results"] = pca_results

        if len(numeric_cols) > 1:
            corr_matrix = df[numeric_cols].corr().round(2)
            eda_results["visualizations"]["correlation"] = {
                "z": corr_matrix.values.tolist(),
                "x": numeric_cols,
                "y": numeric_cols
            }
        return eda_results

    except Exception as e:
        return {"error": str(e)}









