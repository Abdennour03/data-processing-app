import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Bar,
  Pie,
  ResponsiveContainer,
  BarChart,
  PieChart,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import Plot from 'react-plotly.js';
import { useFileContext } from '../context/FileContext';

interface ColumnAnalysis {
  type: string;
  stats?: Record<string, number>;
  unique_count?: number;
  value_counts?: Record<string, number> | string;
}

interface EDAData {
  info: {
    total_rows: number;
    total_columns: number;
  };
  columns_analysis: Record<string, ColumnAnalysis>;
  visualizations?: {
    box_plots?: Array<{ column: string; y: number[] }>;
    correlation?: {
      z: number[][];
      x: string[];
      y: string[];
    };
  };
}

const COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'];

const EDAPage: React.FC = () => {
  const { activeFilename, activeFolder } = useFileContext();
  const [edaData, setEdaData] = useState<EDAData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const boxPlotData = useMemo(() => edaData?.visualizations?.box_plots ?? [], [edaData]);
  const correlationData = useMemo(() => edaData?.visualizations?.correlation ?? null, [edaData]);

  useEffect(() => {
    if (!activeFilename || !activeFolder) {
      setError('No file selected. Please upload a file first.');
      return;
    }

    fetchEDAData();
  }, [activeFilename, activeFolder]);

  const fetchEDAData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/files/eda/${activeFilename}`, {
        params: {
          places_folder: activeFolder,
        },
      });
      
      // Access the nested data structure
      const edaDataFromResponse = response.data?.data || response.data;
      
      if (edaDataFromResponse.error) {
        setError(edaDataFromResponse.error);
        return;
      }
      
      setEdaData(edaDataFromResponse);
      if (edaDataFromResponse.columns_analysis) {
        const columns = Object.keys(edaDataFromResponse.columns_analysis);
        setSelectedColumn(columns[0]);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch EDA data';
      setError(errorMsg);
      console.error('EDA Fetch Error:', errorMsg, err);
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

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-full">
        <div className="text-center">
          <p className="text-white text-xl">Loading EDA data...</p>
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

  if (!edaData) {
    return <div className="w-full" />;
  }

  const selectedColumnData = selectedColumn ? edaData.columns_analysis[selectedColumn] : null;

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Exploratory Data Analysis</h1>
          <p className="text-gray-400">File: {activeFilename} | Folder: {activeFolder}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Rows</p>
            <p className="text-3xl font-bold text-blue-400">{edaData.info.total_rows}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Columns</p>
            <p className="text-3xl font-bold text-blue-400">{edaData.info.total_columns}</p>
          </div>
          {edaData.explained_variance && Array.isArray(edaData.explained_variance) && edaData.explained_variance.length > 0 && (
            edaData.explained_variance.map((variance, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm">PC{idx + 1} Variance</p>
                <p className="text-3xl font-bold text-blue-400">{variance.toFixed(2)}%</p>
              </div>
            ))
          )}
        </div>

        {/* Columns Selection and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Column List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-4">Columns</h2>
            <div className="space-y-2">
              {Object.keys(edaData.columns_analysis).map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColumn(col)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    selectedColumn === col
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Details */}
          <div className="lg:col-span-3">
            {selectedColumnData && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">{selectedColumn}</h3>

                {/* Column Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-800 rounded p-4">
                    <p className="text-gray-400 text-xs">Type</p>
                    <p className="text-lg font-bold text-white">{selectedColumnData.type}</p>
                  </div>
                  {selectedColumnData.unique_count !== undefined && (
                    <div className="bg-gray-800 rounded p-4">
                      <p className="text-gray-400 text-xs">Unique Values</p>
                      <p className="text-lg font-bold text-white">{selectedColumnData.unique_count}</p>
                    </div>
                  )}
                </div>

                {/* Numerical Stats */}
                {selectedColumnData.stats && (
                  <div className="mb-8">
                    <h4 className="text-white font-bold mb-3">Statistical Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(selectedColumnData.stats).map(([key, value]) => (
                        <div key={key} className="bg-gray-800 rounded p-3">
                          <p className="text-gray-400 text-xs">{key}</p>
                          <p className="text-white font-semibold">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categorical Chart */}
                {selectedColumnData.value_counts && typeof selectedColumnData.value_counts === 'object' && (
                  <div className="mb-8">
                    <h4 className="text-white font-bold mb-4">Value Distribution</h4>
                    <div className="bg-gray-800 rounded-lg p-4 h-80 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        {Object.keys(selectedColumnData.value_counts).length <= 5 ? (
                          <PieChart>
                            <Pie
                              data={Object.entries(selectedColumnData.value_counts as Record<string, number>).map(([name, value]) => ({
                                name,
                                value,
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={{ fill: 'white', fontSize: 12 }}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.entries(selectedColumnData.value_counts as Record<string, number>).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        ) : (
                          <BarChart
                            data={Object.entries(selectedColumnData.value_counts as Record<string, number>).map(([name, value]) => ({
                              name,
                              value,
                            }))}
                            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                          >
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#9ca3af' }} />
                            <YAxis tick={{ fill: '#9ca3af' }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                {typeof selectedColumnData.value_counts === 'string' && (
                  <div className="mb-8 p-4 bg-gray-800 rounded-lg text-gray-300">
                    <p className="text-sm">{selectedColumnData.value_counts}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Visualizations */}
        <div className="mt-10 space-y-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Box Plots (Numeric Columns)</h2>
            </div>
            {boxPlotData.length > 0 ? (
              <div className="bg-gray-800 rounded-lg p-4">
                <Plot
                  data={boxPlotData.map((item) => ({
                    type: 'box',
                    name: item.column,
                    y: item.y,
                    boxpoints: false,
                    marker: { color: '#60a5fa' },
                    line: { color: '#3b82f6' },
                  }))}
                  layout={{
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    height: 420,
                    margin: { l: 50, r: 20, t: 30, b: 80 },
                    font: { color: '#e5e7eb' },
                    xaxis: { tickangle: -45 },
                    yaxis: { gridcolor: '#374151' },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
            ) : (
              <p className="text-gray-400">No numeric columns available for box plots.</p>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Correlation Matrix</h2>
            </div>
            {correlationData ? (
              <div className="bg-gray-800 rounded-lg p-4">
                <Plot
                  data={[
                    {
                      type: 'heatmap',
                      z: correlationData.z,
                      x: correlationData.x,
                      y: correlationData.y,
                      colorscale: 'RdBu',
                      zmin: -1,
                      zmax: 1,
                      showscale: true,
                    },
                  ]}
                  layout={{
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    height: 420,
                    margin: { l: 80, r: 20, t: 30, b: 80 },
                    font: { color: '#e5e7eb' },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
                <div className="mt-4 text-gray-300 text-sm">
                  <strong>Description:</strong> This map shows the pairwise correlation coefficients between numeric columns. Values close to 1 indicate strong positive correlation, values close to -1 indicate strong negative correlation, and values near 0 indicate little or no linear relationship. Use this to identify relationships, redundancy, or multicollinearity in your dataset.
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Not enough numeric columns to compute correlation.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EDAPage;
