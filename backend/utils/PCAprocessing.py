import pandas as pd
import numpy as np
import os


def perform_pca(filename: str, n_components: int = 2):
        # 1. Get the absolute path of the current file (EdaProcessing.py)
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 
        file_path = os.path.join(base_dir, "processed", f"cleaned_{filename}")

        if not os.path.exists(file_path):
            return {"error": "Please run Data Cleaning first!"}
        try:
            # 2. Load the cleaned numerical data
            df = pd.read_csv(file_path)
            X = df.values

            # 3. Robust Standardization
            mean = np.mean(X, axis=0)
            std = np.std(X, axis=0)
            
            # FIX: Replace 0 std with 1 to avoid division by zero (Infs)
            std[std == 0] = 1.0 
            
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
            return {
                        "explained_variance": eigen_values[:n_components].tolist(),
                        "pca_results": X_pca.tolist()
                    }
        except Exception as e:
            return {"error": f"Math Error: {str(e)}"}
