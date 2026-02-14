import pandas as pd
import numpy as np
import os
from backend.config import PROCESSED_DATA_DIR, UPLOAD_DIR
from pathlib import Path
        
def perform_pca(filename: str, n_components: int = 2):
        # 1. Get the absolute path of the current file (EdaProcessing.py)
        base_dir = Path(PROCESSED_DATA_DIR ,f"Pca_{filename}")
        base_name = base_dir.stem
        dataset_folder = Path(PROCESSED_DATA_DIR , base_name)
        dataset_folder.mkdir(parents=True, exist_ok=True)
        
        # input dataset 
        input_path = Path(PROCESSED_DATA_DIR , f"cleaned_{filename}")
        # output dataset
        output_path = Path(dataset_folder ,f"{base_name}_k{n_components}.csv")
        if not os.path.exists(input_path):
            return {"error": f"File not found at {input_path}. Please run Data Cleaning first!"}
        try:
            # 2. Load the cleaned numerical data
            df = pd.read_csv(input_path)
            X = df.to_numpy(dtype=np.float64)

            # 3. Robust Standardization
            mean = np.mean(X, axis=0)
            
            std = np.std(X, axis=0)
            std = np.where(std == 0, 1.0, std)
            
            X_std = (X - mean) / std

            # 4. Covariance Matrix
            # Ensure no NaNs exist before this step
            if np.any(np.isnan(X_std)):
                return {"error": "Data contains NaNs after standardization"}
                
            cov_matrix = np.cov(X_std.T)

            # 5. Eigen-decomposition
            eigen_values, eigen_vectors = np.linalg.eigh(cov_matrix)

            # 6. Sort and Project
            idx = np.argsort(eigen_values)[::-1]
            eigen_values = np.maximum(eigen_values[idx].real, 0)
            eigen_vectors = eigen_vectors[:, idx].real

            total_variance = float(np.sum(eigen_values))
            if total_variance == 0:
                variance_ratios = np.zeros_like(eigen_values)
            else:
                variance_ratios = (eigen_values / total_variance) * 100.0

            # Fix: Cap sum of variance ratios to 100% (due to rounding errors)
            variance_ratios = np.clip(variance_ratios, 0, 100)
            variance_ratios = variance_ratios[:len(eigen_values)]
            # If sum > 100 due to rounding, normalize
            total_reported = np.sum(variance_ratios)
            if total_reported > 100.0:
                variance_ratios = (variance_ratios / total_reported) * 100.0

            projection_matrix = eigen_vectors[:, :n_components]
            X_pca = np.dot(X_std, projection_matrix)

            pd.DataFrame(X_pca).to_csv(output_path, index=False)

            explained_variance = [round(float(v), 2) for v in variance_ratios[:n_components].tolist()]
            # Final fix: If sum of explained_variance > 100, normalize
            total_exp = sum(explained_variance)
            if total_exp > 100.0:
                explained_variance = [round(v * 100.0 / total_exp, 2) for v in explained_variance]

            return {
                "status": "pca has been success",
                "file": str(output_path),
                "components": n_components,
                "explained_variance": explained_variance,
                "pca_results": X_pca.real.tolist()[:20000]
            }
        except Exception as e:
            return {"error": f"Math Error: {str(e)}"}