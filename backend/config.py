import os 
from pathlib import Path

# Finds the directory where config.py is located
BASE_DIR = Path(__file__).resolve().parent.parent
# This points to backend/uploads/
UPLOAD_DIR = BASE_DIR / "backend" / "uploads"
# Ensure the folder exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)



CLUSTRED_DATA_DIR = BASE_DIR / "backend" / "uploads"/ "clustring_upload"
NORMAL_DATA_DIR = BASE_DIR / "backend" / "uploads"/ "normal_upload"
PROCESSED_DATA_DIR = BASE_DIR /"backend" / "storage"/ "processed"

# Create them immediately so they exist
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
CLUSTRED_DATA_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)