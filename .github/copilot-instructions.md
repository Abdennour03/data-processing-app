<!-- VS Code Copilot Custom Instructions -->

# Data Processing Dashboard - Development Guide

## Project Overview
This is a **React + TypeScript + Tailwind CSS** dashboard for data processing and analysis, paired with a FastAPI Python backend.

## Architecture
- **Frontend**: React dashboard (Vite + TypeScript)
- **Backend**: FastAPI server for data processing
- **Styling**: Tailwind CSS with blue and white theme
- **State Management**: React hooks
- **Navigation**: React Router

## Key Technologies
- React 18 with TypeScript
- Vite (fast bundler)
- Tailwind CSS for styling
- Axios for API calls
- React Router for pages
- React Icons for UI elements

## Setup Instructions
1. Navigate to `views/` folder
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Access at `http://localhost:3000`

## Development Workflow
- Pages are in `src/pages/`
- Reusable components are in `src/components/`
- API integration is in `src/api/`
- Styling uses Tailwind CSS utility classes

## Color Theme
- Primary: Blue (`#0ea5e9`)
- Background: White
- Accents: Gray tones with blue highlights
- Success: Green
- Error: Red

## API Integration
The frontend proxies requests to FastAPI backend:
```
/api/files/upload  -> POST upload files
/api/files/eda     -> GET EDA analysis
/api/files/pca     -> GET PCA analysis
/api/files/cleane  -> GET data cleaning
```

## Current Pages
- ✅ Dashboard - Overview with stats
- ✅ Upload - File upload interface
- 🔄 EDA - Exploratory data analysis
- 🔄 PCA - Principal component analysis
- 🔄 Cleaning - Data preprocessing

## File Structure
```
views/
├── src/
│   ├── components/Sidebar.tsx    - Navigation sidebar
│   ├── components/Header.tsx     - Top header bar
│   ├── components/Card.tsx       - Reusable card components
│   ├── components/MainLayout.tsx - Layout wrapper
│   ├── pages/Dashboard.tsx       - Home page
│   ├── pages/Upload.tsx          - File upload page
│   ├── pages/EDA.tsx             - EDA page
│   ├── pages/PCA.tsx             - PCA page
│   ├── pages/Cleaning.tsx        - Cleaning page
│   ├── api/client.ts             - API service
│   ├── types/index.ts            - TypeScript types
│   ├── App.tsx                   - Main app component
│   ├── main.tsx                  - Entry point
│   └── index.css                 - Global styles
├── package.json                  - Dependencies
├── tsconfig.json                 - TypeScript config
├── vite.config.ts                - Vite config
├── tailwind.config.js            - Tailwind config
└── postcss.config.js             - PostCSS config
```

## Common Tasks

### Add a New Page
1. Create file in `src/pages/MyPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Sidebar.tsx`

### Add a New Component
1. Create file in `src/components/MyComponent.tsx`
2. Export from component file
3. Import where needed

### Update Styling
- Use Tailwind CSS classes (no custom CSS needed usually)
- Modify `tailwind.config.js` for custom colors/themes
- Global styles in `src/index.css`

### Connect to New API Endpoint
1. Add method in `src/api/client.ts`
2. Update types in `src/types/index.ts`
3. Use in component with `fileAPI.newEndpoint()`

## Build & Deploy
```bash
npm run build  # Creates production build in dist/
npm run preview # Preview production build
```

## Troubleshooting
- **Port conflict**: Change port in `vite.config.ts`
- **API not connecting**: Check backend is running on `http://127.0.0.1:8000`
- **Dependencies issue**: Delete `node_modules` and `package-lock.json`, then reinstall

## Future Enhancements
- Add Recharts visualizations for charts
- Implement EDA dashboard with stats
- Add PCA 2D/3D visualization
- Add data cleaning preview
- Add file management/history
- Add dark mode toggle
- Add export functionality
