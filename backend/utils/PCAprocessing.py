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
            eigen_values, eigen_vectors = np.linalg.eig(cov_matrix)

            # 6. Sort and Project (using .real to handle complex numbers if they appear)
            idx = np.argsort(eigen_values)[::-1]
            eigen_values = eigen_values[idx].real
            eigen_vectors = eigen_vectors[:, idx].real

            projection_matrix = eigen_vectors[:, :n_components]
            X_pca = np.dot(X_std, projection_matrix)

            pd.DataFrame(X_pca).to_csv(output_path, index=False)
            return {
                        "status":  "pca has been success",
                        "flie": str(output_path),
                        "components": n_components,
                        "explained_variance": eigen_values[:n_components].real.tolist(),
                        "pca_results": X_pca.real.tolist()[:10]
                    }
        except Exception as e:
            return {"error": f"Math Error: {str(e)}"}