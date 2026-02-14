import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Plot from 'react-plotly.js';
import { useFileContext } from '../context/FileContext';

interface PCAPoint {
  x?: number;
  y?: number;
  z?: number;
}

interface PCAData {
  components: number;
  points: PCAPoint[];
  explained_variance?: number[];
  status?: string;
}

const PCAPage: React.FC = () => {
  const { activeFilename, activeFolder } = useFileContext();
  const [pcaData, setPcaData] = useState<PCAData | null>(null);
  const [nComponents, setNComponents] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    if (!activeFilename || !activeFolder) {
      setError('No file selected. Please upload a file first.');
      return;
    }

    fetchPCAData(nComponents);
  }, [activeFilename, activeFolder, nComponents]);

  const fetchPCAData = async (components: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/files/pca/${activeFilename}`, {
        params: {
          n: components,
        },
      });
      
      // Access the nested data structure from controller
      const pcaResult = response.data?.details || response.data?.data || response.data;
      
      if (pcaResult.error) {
        setError(pcaResult.error);
        return;
      }
      
      // Convert pca_results array to point objects
      const points: PCAPoint[] = (pcaResult.pca_results || []).map((result: number[]) => {
        if (components === 2) {
          return { x: result[0], y: result[1] };
        } else {
          return { x: result[0], y: result[1], z: result[2] };
        }
      });
      
      setPcaData({
        components: pcaResult.components || components,
        points: points,
        explained_variance: pcaResult.explained_variance,
        status: pcaResult.status,
      });
      
      setIs3D(components === 3);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch PCA data';
      setError(errorMsg);
      console.error('PCA Fetch Error:', errorMsg, err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeFilename || !activeFolder) {
    return (
      <div className="w-full flex items-center justify-center min-h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">No Data Selected</h2>
          <p className="text-gray-400">Please upload a file first</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-900 text-red-100 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  const prepare2DData = () => {
    return pcaData?.points.map((point, idx) => ({
      x: point.x || 0,
      y: point.y || 0,
      index: idx,
    })) || [];
  };

  const prepare3DData = () => {
    if (!pcaData) return [];
    return [
      {
        x: pcaData.points.map((p) => p.x || 0),
        y: pcaData.points.map((p) => p.y || 0),
        z: pcaData.points.map((p) => p.z || 0),
        mode: 'markers',
        type: 'scatter3d' as const,
        marker: {
          size: 4,
          color: pcaData.points.map((_, idx) => idx),
          colorscale: 'Viridis',
        },
      } as any,
    ];
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Principal Component Analysis (PCA)</h1>
          <p className="text-gray-400">File: {activeFilename} | Folder: {activeFolder}</p>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Number of Components */}
            <div>
              <label className="block text-white font-medium mb-2">Number of Components</label>
              <div className="flex gap-2">
                {[2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNComponents(num)}
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      nComponents === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {num}D
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode (3D only) */}
            {nComponents === 3 && (
              <div>
                <label className="block text-white font-medium mb-2">View Mode</label>
                <p className="text-gray-400 text-sm">Interactive 3D scatter plot</p>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 h-96 flex items-center justify-center">
            <p className="text-white text-lg">Loading PCA visualization...</p>
          </div>
        ) : pcaData ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            {nComponents === 2 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="x"
                      type="number"
                      tick={{ fill: '#9ca3af' }}
                      label={{ value: 'PC1', position: 'insideBottomRight', offset: -10, fill: '#9ca3af' }}
                    />
                    <YAxis
                      dataKey="y"
                      type="number"
                      tick={{ fill: '#9ca3af' }}
                      label={{ value: 'PC2', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#e5e7eb',
                      }}
                      formatter={(value: any) => value.toFixed(3)}
                    />
                    <Scatter name="Points" data={prepare2DData()} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: '500px' }}>
                <Plot
                  data={prepare3DData()}
                  layout={{
                    scene: {
                      xaxis: { title: 'PC1', backgroundcolor: '#111827', gridcolor: '#374151' },
                      yaxis: { title: 'PC2', backgroundcolor: '#111827', gridcolor: '#374151' },
                      zaxis: { title: 'PC3', backgroundcolor: '#111827', gridcolor: '#374151' },
                    },
                    paper_bgcolor: '#0f172a',
                    plot_bgcolor: '#1f2937',
                    font: { color: '#e5e7eb' },
                    margin: { l: 0, r: 0, b: 0, t: 0 },
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            )}
          </div>
        ) : null}

        {/* Stats */}
        {pcaData && pcaData.points.length > 0 && (
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded p-4">
                <p className="text-gray-400 text-xs">Components</p>
                <p className="text-2xl font-bold text-blue-400">{pcaData.components}</p>
              </div>
              <div className="bg-gray-800 rounded p-4">
                <p className="text-gray-400 text-xs">Data Points</p>
                <p className="text-2xl font-bold text-blue-400">{pcaData.points.length}</p>
              </div>
              {pcaData.explained_variance && pcaData.explained_variance.length > 0 && (
                pcaData.explained_variance.map((variance, idx) => (
                  <div key={idx} className="bg-gray-800 rounded p-4">
                    <p className="text-gray-400 text-xs">PC{idx + 1} Variance</p>
                    <p className="text-lg font-bold text-blue-400">
                      {variance.toFixed(2)}%
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PCAPage;
