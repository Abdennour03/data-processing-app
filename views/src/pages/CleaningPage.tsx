import React, { useMemo, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ScatterChart,
  Scatter,
  CartesianGrid,
} from 'recharts';
import { useFileContext } from '../context/FileContext';

interface CleaningResult {
  status: string;
  message: string;
  initial_rows: number;
  final_rows: number;
  rows_removed: number;
  removed_columns_count: number;
  cleaned_file: string;
  missing_values_comparison: { raw: number; cleaned: number };
  raw_data_preview: Array<Record<string, any>>;
  cleaned_data_preview: Array<Record<string, any>>;
}

const CleaningPage: React.FC = () => {
  const { activeFilename } = useFileContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [error, setError] = useState<string>('');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [plotDataRaw, setPlotDataRaw] = useState<Array<Record<string, any>>>([]);
  const [plotDataCleaned, setPlotDataCleaned] = useState<Array<Record<string, any>>>([]);
  const [plotOutliers, setPlotOutliers] = useState<{ raw?: number; cleaned?: number }>({});
  const [plotLoading, setPlotLoading] = useState(false);

  const cleanedColumns = useMemo(() => {
    if (!result?.cleaned_data_preview || result.cleaned_data_preview.length === 0) return [];
    return Object.keys(result.cleaned_data_preview[0]);
  }, [result]);

  const handleDownload = () => {
    if (!activeFilename) return;
    const downloadUrl = `http://127.0.0.1:8000/api/files/download/${activeFilename}`;
    window.location.assign(downloadUrl);
  };

  const handleClean = async () => {
    if (!activeFilename) {
      setError('Please upload a file first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/files/cleane/${activeFilename}`);
      const cleanResult = response.data?.details || response.data;
      
      if (cleanResult.error) {
        setError(cleanResult.error);
        return;
      }
      
      setResult(cleanResult);
      if (cleanResult.cleaned_data_preview && cleanResult.cleaned_data_preview.length > 0) {
        const columns = Object.keys(cleanResult.cleaned_data_preview[0]);
        setXAxis(columns[0] || '');
        setYAxis(columns[1] || columns[0] || '');
      }
      setPlotDataRaw([]);
      setPlotDataCleaned([]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to clean data';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualize = async () => {
    if (!activeFilename || !xAxis || !yAxis) return;
    setPlotLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/files/custom_plot', {
        params: {
          filename: activeFilename,
          x: xAxis,
          y: yAxis,
          folder: 'normal',
        },
      });
      setPlotDataRaw(response.data?.raw_data || []);
      setPlotDataCleaned(response.data?.cleaned_data || []);
      setPlotOutliers({
        raw: response.data?.raw_outliers,
        cleaned: response.data?.cleaned_outliers,
      });
    } catch (err) {
      console.error('Custom Plot Error:', err);
    } finally {
      setPlotLoading(false);
    }
  };

  if (!activeFilename) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-gray-900/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-2">No Data Selected</h2>
          <p className="text-gray-400">Please upload a CSV file to start cleaning.</p>
        </div>
      </div>
    );
  }

  const retentionRate = result ? ((result.final_rows / result.initial_rows) * 100).toFixed(1) : 0;

  return (
    <div className="w-full animate-in fade-in duration-700 p-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">DATA CLEANING</h1>
          <p className="text-gray-500 font-medium">Target: <span className="text-blue-400 font-mono">{activeFilename}</span></p>
        </header>

        <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] rounded-full"></div>

          {!result ? (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                  Cleaning Operations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Outlier Detection (IQR)', 'Null Value Imputation', 'Categorical Encoding', 'Drop Constants'].map((op) => (
                    <div key={op} className="flex items-center gap-3 bg-gray-800/30 p-3 rounded-xl border border-gray-700/30 text-gray-400 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                      {op}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/50 text-red-200 text-sm animate-shake">
                  {error}
                </div>
              )}

              <button
                onClick={handleClean}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-xl transition-all relative overflow-hidden group ${
                  loading ? 'bg-gray-800 text-gray-500' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    PROCESSING...
                  </span>
                ) : 'START CLEANING'}
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              {/* Status Header */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex items-center gap-4">
                <div className="bg-emerald-500 p-2 rounded-xl text-black shadow-lg shadow-emerald-500/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <h3 className="text-emerald-400 font-black tracking-wide">SUCCESS</h3>
                  <p className="text-emerald-100/60 text-xs font-medium">{result.message}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-2xl">
                  <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Rows Dropped</p>
                  <p className="text-3xl font-black text-red-500">{Math.abs(result.rows_removed)}</p>
                </div>
                <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-2xl">
                  <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Cols Removed</p>
                  <p className="text-3xl font-black text-orange-500">{Math.abs(result.removed_columns_count)}</p>
                </div>
                <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-2xl">
                  <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Retention</p>
                  <p className="text-3xl font-black text-blue-500">{retentionRate}%</p>
                </div>
              </div>

              {/* Progress Visual */}
              <div className="bg-gray-800/20 border border-gray-700/30 p-6 rounded-3xl">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-bold text-gray-300 tracking-tight">Dataset Integrity</span>
                  <span className="text-xs font-mono text-gray-500">{result.final_rows} / {result.initial_rows} rows</span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full p-1 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    style={{ width: `${retentionRate}%` }}
                  ></div>
                </div>
              </div>


              {/* Interactive Plotter */}
              {cleanedColumns.length > 0 && (
                <div className="bg-gray-800/20 border border-gray-700/30 p-6 rounded-3xl">
                  <div className="flex flex-wrap gap-4 items-end mb-6">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 font-bold">X Axis</label>
                      <select
                        value={xAxis}
                        onChange={(e) => setXAxis(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-700 px-3 py-2 rounded-md"
                      >
                        {cleanedColumns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 font-bold">Y Axis</label>
                      <select
                        value={yAxis}
                        onChange={(e) => setYAxis(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-700 px-3 py-2 rounded-md"
                      >
                        {cleanedColumns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleVisualize}
                      disabled={plotLoading}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md font-bold transition-all active:scale-95 disabled:opacity-50"
                    >
                      {plotLoading ? 'Loading...' : 'VISUALIZE'}
                    </button>
                  </div>
                  {plotOutliers.raw !== undefined && plotOutliers.cleaned !== undefined && (
                    <div className="flex gap-6 mb-4">
                      <div className="flex-1 bg-gray-900/40 border border-gray-700/50 p-4 rounded-2xl text-center">
                        <p className="text-gray-500 text-xs">Raw Outliers</p>
                        <p className="text-lg font-bold text-red-500">{plotOutliers.raw}</p>
                      </div>
                      <div className="flex-1 bg-gray-900/40 border border-gray-700/50 p-4 rounded-2xl text-center">
                        <p className="text-gray-500 text-xs">Cleaned Outliers</p>
                        <p className="text-lg font-bold text-blue-500">{plotOutliers.cleaned}</p>
                      </div>
                      <div className="flex-1 bg-gray-900/40 border border-gray-700/50 p-4 rounded-2xl text-center">
                        <p className="text-gray-500 text-xs">Noise Reduced</p>
                        <p className="text-lg font-bold text-green-500">
                          {plotOutliers.raw > 0 ? `${Math.round(100 * (plotOutliers.raw - plotOutliers.cleaned) / plotOutliers.raw)}%` : '0%'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="text-center text-xs text-gray-400 mb-2">Raw Data</div>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart key={plotDataRaw.length + '-' + xAxis + '-' + yAxis} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid stroke="#374151" />
                          <XAxis dataKey={xAxis} tick={{ fill: '#9ca3af' }} />
                          <YAxis dataKey={yAxis} tick={{ fill: '#9ca3af' }} />
                          <Tooltip />
                          <Scatter data={plotDataRaw} fill="#ef4444" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1">
                      <div className="text-center text-xs text-gray-400 mb-2">Cleaned Data</div>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart key={plotDataCleaned.length + '-' + xAxis + '-' + yAxis} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid stroke="#374151" />
                          <XAxis dataKey={xAxis} tick={{ fill: '#9ca3af' }} />
                          <YAxis dataKey={yAxis} tick={{ fill: '#9ca3af' }} />
                          <Tooltip />
                          <Scatter data={plotDataCleaned} fill="#3b82f6" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {plotLoading && (
                    <div className="text-center text-blue-400 animate-pulse mt-4">Rendering data...</div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleDownload}
                  className="flex-[2] group flex items-center justify-center gap-3 bg-white hover:bg-emerald-400 text-gray-900 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95"
                >
                  <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  DOWNLOAD CLEANED DATA
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-2xl font-bold transition-all border border-gray-700/50"
                >
                  New File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CleaningPage;