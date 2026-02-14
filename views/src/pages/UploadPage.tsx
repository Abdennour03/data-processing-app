import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useFileContext } from '../context/FileContext';

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState<'normal' | 'clustering'>('normal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('');
  const { setActiveFile } = useFileContext();
  const navigate = useNavigate();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setActiveFile(file.name, folder);
      setMessage(`File uploaded successfully: ${file.name}`);
      setMessageType('success');
      setFile(null);
      
      setTimeout(() => {
        navigate('/eda');
      }, 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.message || 'Upload failed';
      setMessage(errorMsg);
      setMessageType('error');
      console.error('Upload Error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Upload Data</h1>
        <p className="text-gray-400 mb-8">Upload your CSV file for processing</p>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          {/* Folder Selection */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-3">Folder Type</label>
            <div className="flex gap-4">
              {['normal', 'clustering'].map((folderType) => (
                <button
                  key={folderType}
                  onClick={() => setFolder(folderType as 'normal' | 'clustering')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      folder === folderType
                        ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  {folderType.charAt(0).toUpperCase() + folderType.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* File Input */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-3">Select CSV File</label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 hover:border-gray-600 transition-all">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full text-gray-300"
              />
              {file && (
                <p className="text-green-400 mt-2">✓ Selected: {file.name}</p>
              )}
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-900 text-green-100'
                : 'bg-red-900 text-red-100'
            }`}>
              {message}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              !file || loading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
