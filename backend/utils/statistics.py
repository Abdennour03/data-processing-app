import pandas as pd
import os

def get_basic_stats(file_path: str):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == '.csv':
        df = pd.read_csv(file_path)

    elif ext in ['.xlsx', '.xls']:
        df = pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format")

    stats = {
        "filename": os.path.basename(file_path),
        "shape":
    }