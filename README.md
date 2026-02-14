# Data Processing Application

A data processing dashboard (The Abdennour Lab) with FastAPI backend for data analysis operations including EDA (Exploratory Data Analysis), PCA (Principal Component Analysis), and data cleaning.

---

## Project Structure

```
/home/abdennour/data-processing-app/
├── main.py                 # FastAPI entry point
├── requirements.txt        # Python dependencies
├── backend/               # All backend logic
│   ├── config.py          # Configuration and path management
│   ├── controllers/       # API logic layer
│   ├── routes/            # API endpoints
│   ├── models/            # Data models
│   ├── utils/             # Data processing utilities
│   ├── uploads/           # Uploaded file storage
│   └── storage/           # Processed data storage
├── views/                 # React Frontend (to be replaced)
└── explainiation/         # Jupyter notebooks for documentation
```

---

## Backend Architecture

### 1. Configuration (backend/config.py)

Sets up directories for data storage and management:

- UPLOAD_DIR: Base upload directory
- NORMAL_DATA_DIR: Normal dataset uploads
- CLUSTRED_DATA_DIR: Clustering dataset uploads
- PROCESSED_DATA_DIR: Cleaned and processed data outputs

All directories are created automatically on startup.

---

### 2. Controllers (backend/controllers/File/FileController.py)

Handles API business logic with 4 main operations:

#### upload_file_controller()
- Accepts CSV, XLSX, or JSON files
- Validates file size (max 30MB)
- Routes to normal or clustering folder
- Returns: Success message with file path

#### get_eda_controller()
- Performs Exploratory Data Analysis
- Calculates statistics for numeric columns
- Counts unique values for categorical columns
- Returns: Row count, column count, detailed statistics

#### get_pca_controller()
- Applies Principal Component Analysis
- Requires n_components parameter
- Projects data to lower dimensions
- Returns: PCA results, explained variance ratios

#### get_cleaning_controller()
- Cleans and preprocesses data
- Removes outliers and missing values
- Converts categorical to numeric
- Returns: Cleaned file path, row counts, removed columns

---

### 3. API Routes (backend/routes/files/route.py)

RESTful endpoints for data processing:

POST /api/files/upload
- Upload files to normal or clustering folder
- Parameters: file, places_folder (normal or clustering)

GET /api/files/eda/{filename}
- Get exploratory data analysis
- Parameters: filename, places_folder

GET /api/files/pca/{filename}
- Apply PCA transformation
- Parameters: filename, n (number of components, default=2)

GET /api/files/cleane/{filename}
- Clean and preprocess data
- Parameters: filename

---

### 4. Data Processing Utilities

#### EDAprocessing.py - perform_eda(filename, places_folder)

Performs statistical analysis on datasets:

Input: CSV file from upload directory
Output: Dictionary containing:
- total_rows: Number of observations
- total_columns: Number of features
- columns_analysis: Per-column statistics
  - For numeric: mean, std, min, 25%, 50%, 75%, max
  - For categorical: unique count, value counts

#### DataCleaning.py - clean_and_cave_data(filename, places_folder)

Preprocessing pipeline with 5 steps:

1. Remove columns: ID columns, constant columns
2. Handle missing values:
   - Numeric: Fill with mean
   - Categorical: Fill with mode or "Missing"
3. Remove outliers: IQR method (Q1 - 1.5*IQR, Q3 + 1.5*IQR)
4. Encode categorical: Convert to numeric codes
5. Type conversion: Ensure all data is numeric (float64)

Output: Cleaned CSV file at PROCESSED_DATA_DIR/cleaned_{filename}

#### PCAprocessing.py - perform_pca(filename, n_components)

Dimensionality reduction via Principal Component Analysis:

1. Load cleaned data from storage
2. Standardize: Zero mean, unit variance
3. Covariance matrix: Calculate feature covariances
4. Eigen-decomposition: Extract eigenvalues and eigenvectors
5. Project data: Transform to n_components dimensions

Output: PCA results CSV + explained variance for each component

Stored at: PROCESSED_DATA_DIR/Pca_{filename}/Pca_{filename}_k{n}.csv

---

## Storage Structure

### Uploads Directory (backend/uploads/)

Data uploaded by users organized by processing type:

```
backend/uploads/
├── normal_upload/
│   ├── swiggy.csv
│   └── data_pca_200x16.csv
└── clustring_upload/
    ├── marketing_AB.csv
    └── swiggy.csv
```

### Processed Directory (backend/storage/processed/)

Output data from cleaning and PCA operations:

```
backend/storage/processed/
├── cleaned_swiggy.csv
├── cleaned_data_pca_200x16.csv
├── Pca_swiggy/
│   ├── Pca_swiggy_k2.csv
│   └── Pca_swiggy_k3.csv
└── Pca_data_pca_200x16/
    ├── Pca_data_pca_200x16_k2.csv
    └── Pca_data_pca_200x16_k3.csv
```

---

## Data Flow

1. User uploads file via POST /api/files/upload
   - File stored in NORMAL_DATA_DIR or CLUSTRED_DATA_DIR

2. User requests EDA via GET /api/files/eda/{filename}
   - EDAprocessing.perform_eda() analyzes file
   - Returns statistics JSON

3. User requests data cleaning via GET /api/files/cleane/{filename}
   - DataCleaning.clean_and_cave_data() processes file
   - Output saved to PROCESSED_DATA_DIR/cleaned_{filename}

4. User requests PCA via GET /api/files/pca/{filename}
   - Requires cleaned data from step 3
   - PCAprocessing.perform_pca() performs dimensionality reduction
   - Results saved to PROCESSED_DATA_DIR/Pca_{filename}/

---

## Technology Stack

Framework:
- FastAPI: Modern Python web framework for building APIs
- Uvicorn: ASGI web server (runs on port 8000)

Data Processing:
- Pandas: Data manipulation and CSV handling
- NumPy: Numerical computations for PCA
- Scikit-learn: Machine learning algorithms

Middleware:
- CORS: Enabled for localhost:3000 (React frontend)

---

## Dependencies

See requirements.txt:

```
fastapi
uvicorn
pandas
numpy
matplotlib
python-multipart
```

---

## Running the Backend

From project root directory:

```bash
# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python main.py
```

Server will run on: http://127.0.0.1:8000

---

## API Response Examples

### EDA Response

```json
{
  "info": {
    "total_rows": 200,
    "total_columns": 16
  },
  "columns_analysis": {
    "column_name": {
      "type": "numeric",
      "stats": {
        "mean": 50.5,
        "std": 15.3,
        "min": 10.0,
        "25%": 38.2,
        "50%": 50.5,
        "75%": 62.8,
        "max": 99.9
      }
    }
  }
}
```

### PCA Response

```json
{
  "status": "pca has been success",
  "file": "/path/to/pca_result.csv",
  "components": 2,
  "explained_variance": [5.2, 2.8],
  "pca_results": [[...], [...]]
}
```

### Cleaning Response

```json
{
  "status": "success",
  "cleaned_file": "cleaned_filename.csv",
  "row_after_outliers": 195,
  "removed_columns": ["id", "constant_col"],
  "message": "Successfully removed 2 non-informative columns",
  "path": "/path/to/cleaned_file.csv"
}
```

---

## Error Handling

The API returns appropriate HTTP status codes:

- 200: Successful operation
- 400: Invalid file type or parameters
- 413: File too large (exceeds 30MB limit)
- 500: Server error during processing

Error responses include detailed messages for debugging.

---

## Future Enhancements

- Add visualization endpoints (Matplotlib/Plotly)
- Implement advanced clustering algorithms
- Add feature scaling options
- Support for more file formats
- Database integration for file history
- Batch processing capabilities
- Advanced filtering and transformation options
