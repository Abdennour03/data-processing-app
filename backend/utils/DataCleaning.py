import pandas as pd
import os
import numpy as np


def clean_and_cave_data(filename: str):

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_path = os.path.join(base_dir, "uploads", filename)
    output_folder = os.path.join(base_dir, "processed")


    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    output_path = os.path.join(output_folder, f"cleaned_{filename}")

    try:
        df = pd.read_csv(input_path, sep=None, engine="python", decimal=',')
        # Handle Missing Values...
        for col in df.columns:
            if df[col].dtype in ['int64', 'float64']:
                df[col] = df[col].fillna(df[col].mean())

            else:
                df[col] = df[col].fillna(df[col].mode()[0])

        # Handle Outliers (IQR)
        numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns
        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR

            df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]

            #Label Encoding ...
        for col in df.select_dtypes(include=['object']).columns:
            df[col] = df[col].astype('category').cat.codes

        for col in df.columns:
            if df[col].nunique() <= 1:
                df.drop(col, axis=1, inplace=True)

        # Final NaN check just to be safe before saving        
        df = df.fillna(0)
        # Save the new version
        df.to_csv(output_path, index=False)
    
        return {"status": "success", 
                "cleaned_file": f"cleaned_{filename}",
                "row_after_outliers": len(df)
                }
    except Exception as e:
        return {"error": str(e)}