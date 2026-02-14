import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { FileProvider } from './context/FileContext';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import EDAPage from './pages/EDAPage';
import CleaningPage from './pages/CleaningPage';
import PCAPage from './pages/PCAPage';
import './index.css';

function App() {
  return (
    <FileProvider>
      <Router>
        <div className="flex min-h-screen bg-[#020617] text-white">
          
          <Sidebar />

          <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            <div className="p-8 pb-20"> 
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/eda" element={<EDAPage />} />
                <Route path="/cleaning" element={<CleaningPage />} />
                <Route path="/pca" element={<PCAPage />} />
              </Routes>
            </div>
          </main>

        </div>
      </Router>
    </FileProvider>
  );
}

export default App;