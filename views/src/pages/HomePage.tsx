import React from 'react';
import { Link } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';

const HomePage: React.FC = () => {
  const { activeFilename, activeFolder } = useFileContext();

  const features = [
    {
      title: 'Upload Data',
      description: 'Upload your CSV files for processing',
      path: '/upload',
      icon: '📤',
    },
    {
      title: 'Exploratory Analysis',
      description: 'Analyze and visualize your data',
      path: '/eda',
      icon: '📊',
    },
    {
      title: 'Data Cleaning',
      description: 'Clean and preprocess your data',
      path: '/cleaning',
      icon: '🧹',
    },
    {
      title: 'PCA Analysis',
      description: 'Perform Principal Component Analysis',
      path: '/pca',
      icon: '📈',
    },
  ];

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">The Abdennour Lab</h1>
          <p className="text-xl text-gray-400">
            A comprehensive platform for data analysis, cleaning, and visualization
          </p>
        </div>

        {/* Current Status */}
        {activeFilename && (
          <div className="bg-blue-900 border border-blue-800 rounded-lg p-6 mb-12">
            <h2 className="text-lg font-bold text-white mb-2">Active File</h2>
            <p className="text-blue-100">
              📄 {activeFilename} <span className="text-sm text-blue-300">({activeFolder})</span>
            </p>
          </div>
        )}

        {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature) => (
            <Link
              key={feature.path}
              to={feature.path}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all hover:shadow-blue-600/20"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
              <div className="mt-4 text-blue-400 font-medium">Learn more →</div>
            </Link>
          ))}
        </div>

        {/* Getting Started */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Upload your CSV file using the Upload page</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">2.</span>
              <span>Explore your data with visualizations on the EDA page</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">3.</span>
              <span>Clean your data using automated data cleaning</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">4.</span>
              <span>Perform PCA analysis and reduce dimensionality</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
