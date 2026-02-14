# The Abdennour Lab - Frontend

A modern React + Vite dashboard for data processing, visualization, and analysis with FastAPI backend integration.

## Features

- **Sidebar Navigation**: Easy navigation between all features
- **File Upload**: Upload CSV files to 'normal' or 'clustering' folders
- **Exploratory Data Analysis (EDA)**: Visualize data with interactive charts
  - Display column statistics
  - Show value distributions (pie/bar charts for categorical data)
  - Display statistical summaries for numerical data
- **Data Cleaning**: Automated data cleaning operations
- **PCA Analysis**: 2D and 3D scatter plot visualization

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with dark theme (Gray-950)
- **Recharts** for 2D visualizations
- **Plotly.js** for 3D visualizations
- **React Router** for navigation
- **Axios** for API communication

## Project Structure

```
views/
├── src/
│   ├── components/
│   │   └── Sidebar.tsx          # Navigation sidebar
│   ├── pages/
│   │   ├── HomePage.tsx         # Home/Dashboard page
│   │   ├── UploadPage.tsx       # File upload page
│   │   ├── EDAPage.tsx          # Data exploration with charts
│   │   ├── CleaningPage.tsx     # Data cleaning page
│   │   └── PCAPage.tsx          # PCA visualization (2D/3D)
│   ├── context/
│   │   └── FileContext.tsx      # Global state management
│   ├── App.tsx                  # Main app component with routing
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## Setup & Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- Python FastAPI backend running on `http://localhost:8000`

### Installation

```bash
# Navigate to views folder
cd views

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will use the Vite proxy to forward API calls to the FastAPI backend.

## Usage

### 1. Upload Data
- Navigate to the Upload page via sidebar
- Select folder type ('normal' or 'clustering')
- Choose a CSV file
- Click "Upload File"

### 2. Explore Data (EDA)
- After upload, navigate to EDA page
- View dataset summary (rows/columns)
- Select columns to analyze
- View statistics and visualizations:
  - Categorical data: Pie/Bar charts
  - Numerical data: Statistical summaries

### 3. Clean Data
- Go to Cleaning page
- Click "Start Cleaning" to process the data
- Operations include: null removal, duplicate handling, data standardization

### 4. PCA Analysis
- Navigate to PCA page
- Choose between 2D or 3D analysis
- Interactive scatter plot visualization

## API Integration

The dashboard communicates with the FastAPI backend:

- **POST /upload**: Upload CSV files
- **GET /eda**: Get exploratory data analysis
- **GET /clean**: Clean data
- **GET /pca**: Perform PCA analysis

### Environment Configuration

API proxy is configured in `vite.config.ts` to forward API calls:
```
/api/* → http://localhost:8000/*
```

## Global State Management

Uses React Context API for managing:
- `activeFilename`: Currently selected file
- `activeFolder`: Active folder ('normal' or 'clustering')

Access via `useFileContext()` hook in any component.

## Styling

- **Base Theme**: Dark theme using Tailwind CSS Gray-950
- **Primary Color**: Blue-600
- **Responsive**: Fully responsive design for desktop and tablet views

## Development Notes

- Components use TypeScript for type safety
- Recharts for 2D data visualization
- Plot.ly for 3D scatter plots
- Tailwind CSS for styling (no inline styles)
- Error boundaries and loading states included

## Future Enhancements

- Add data export functionality
- Implement advanced filtering options
- Add more statistical analyses
- Real-time data preview
- Drag-and-drop file upload
- Data download options

## Troubleshooting

### API Connection Issues
- Ensure FastAPI backend is running on `http://localhost:8000`
- Check CORS settings in backend
- Verify the proxy configuration in `vite.config.ts`

### Missing Dependencies
```bash
npm install
npm install --save-dev tailwindcss postcss autoprefixer
```

### Port Already in Use
```bash
npm run dev -- --port 3001
```

## License

Part of The Abdennour Lab project
