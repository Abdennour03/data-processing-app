import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UploadCloud, BarChart2, Wrench, TrendingUp } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Upload', path: '/upload', icon: <UploadCloud size={18} /> },
    { name: 'EDA', path: '/eda', icon: <BarChart2 size={18} /> },
    { name: 'Cleaning', path: '/cleaning', icon: <Wrench size={18} /> },
    { name: 'PCA', path: '/pca', icon: <TrendingUp size={18} /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-6">
      <div className="mb-12">
        <h1 className="text-2xl font-bold text-white">DataProc</h1>
        <p className="text-gray-400 text-sm mt-1">Dashboard</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl text-white">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-12 pt-6 border-t border-gray-800">
        <p className="text-xs text-gray-500">v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
