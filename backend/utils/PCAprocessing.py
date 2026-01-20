import pandas as pd
import numpy as np
import matplotlib as pl
import multipart
import os


def perform_pca(filename: str, n_components: int = 2):
    # 1. Get the absolute path of the current file (EdaProcessing.py)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 
    
    # 2. Join it to reach the uploads folder
    file_path = os.path.join(base_dir, "uploads", filename)

    if not os.path.exists(file_path):
        return {"error": "File not found"}

    try:
        df = pd.read_csv(file_path, sep=None, engine='python', decimal=',')
        X = df.select_dtypes(include=['number']).values
        # 1- Standardization (Center and Scale)
        mean = np.mean(X, axis=0)
        std = np.std(X, axis=0)
        X_std = (X - mean) / std
        
        # 2-Covariance Matrix
        n_samples = X_std.shape[0]
        covariance_matrix = np.dot(X_std.T, X_std) / (n_samples - 1)

        # 3. Sort Eigenvectors by Eigenvalues (descending)
        eigenvalues, eigenvectors = np.linalg.eig(covariance_matrix)

        # 4. Sort Eigenvectors by Eigenvalues (descending)
        idx = eigenvalues.argsort()[::-1]
        eigenvalues = eigenvalues[idx]
        eigenvectors = eigenvectors[:, idx]

        # 5. Project the data
        projection_matrix = eigenvectors[:, :n_components]
        X_pca = np.dot(X_std, projection_matrix)

        # 7. Calculate Explained Variance Ratio  
        total_variance = np.sum(eigenvalues)
        explained_variance = (eigenvalues[:n_components] / total_variance).tolist()
        return {
                "method": "Manual Mathematical Implementation",
                "explained_variance": explained_variance,
                "new_shape": X_pca.shape,
                "pca_data_preview": X_pca[:, :].tolist() # Return first 3 rows
            }
    except Exception as e:
        return {"error": f"Math Error: {str(e)}"}
