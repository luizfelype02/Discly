import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle2, RefreshCw, Sparkles, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DataPreview = ({
  fileData,
  previewData,
  selectedColumns,
  setSelectedColumns,
  appState,
  onProcessComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState('xlsx');

  useEffect(() => {
    if (fileData && fileData.preview && fileData.preview.length > 0 && selectedColumns.length === 0) {
      const numericColumns = [];
      const sampleRow = fileData.preview[0] || [];
      
      sampleRow.forEach((cell, idx) => {
        if (typeof cell === 'number' || (!isNaN(parseFloat(cell)) && isFinite(cell))) {
          numericColumns.push(idx);
        }
      });
      
      setSelectedColumns(numericColumns);
    }
  }, [fileData, selectedColumns, setSelectedColumns]);

  const handleColumnToggle = (colIdx) => {
    setSelectedColumns((prev) => {
      if (prev.includes(colIdx)) {
        return prev.filter((idx) => idx !== colIdx);
      } else {
        return [...prev, colIdx];
      }
    });
  };

  const handleProcess = async () => {
    if (selectedColumns.length === 0) {
      toast.error('Selecione pelo menos uma coluna para arredondar');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await axios.post(`${API}/process-excel`, {
        file_id: fileData.file_id,
        selected_columns: selectedColumns,
        percentage: parseFloat(percentage) || 0,
      });

      onProcessComplete(response.data);
      
      // Show appropriate toast message based on percentage
      if (percentage > 0) {
        toast.success(`Dados processados com aumento de ${percentage}%! ✨`);
      } else if (percentage < 0) {
        toast.success(`Dados processados com desconto de ${Math.abs(percentage)}%! ✨`);
      } else {
        toast.success('Dados processados com sucesso! ✨');
      }
    } catch (err) {
      console.error('Processing error:', err);
      toast.error(err.response?.data?.detail || 'Erro ao processar dados. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await axios.get(`${API}/download-excel/${fileData.file_id}?format=${downloadFormat}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rounded_data.${downloadFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Arquivo ${downloadFormat.toUpperCase()} baixado com sucesso! 🎉`);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Erro ao baixar arquivo. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const displayData = previewData ? previewData.preview : fileData.preview;

  if (!fileData || !fileData.headers || !displayData) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
        <p className="text-white mt-4 font-body">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-600 via-blue-500 to-green-500 p-3 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-heading text-gray-900">
                {appState === 'download_ready' ? 'Prévia & Download' : 'Selecione as Colunas'}
              </h2>
              <p className="text-lg text-gray-600 mt-1 font-body">
                {fileData.row_count} linhas × {fileData.column_count} colunas
              </p>
            </div>
          </div>
          {appState === 'download_ready' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex flex-col sm:flex-row items-end sm:items-center gap-4"
            >
              {/* Format Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 font-body">Formato do Arquivo:</label>
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                  data-testid="format-selector"
                  className="px-4 py-3 text-base font-semibold text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-lg font-body"
                >
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="xls">Excel (.xls)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>
              
              {/* Download Button */}
              <Button
                data-testid="download-button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-[#35E3B5] hover:bg-[#2BC9A0] text-white h-14 px-10 rounded-2xl font-semibold font-body text-lg shadow-2xl hover:shadow-teal-500/50 transition-all"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                    Baixando...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-3" />
                    Baixar {downloadFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Column Selector */}
      {appState === 'preview' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-3xl p-8 shadow-2xl"
        >
          <h3 className="text-2xl font-heading text-gray-900 mb-6">
            Selecione as colunas para aplicar arredondamento
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {fileData.headers.map((header, idx) => (
              <motion.label
                key={`checkbox-${idx}-${header}`}
                data-testid={`column-checkbox-${idx}`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 cursor-pointer group p-4 rounded-2xl bg-white/60 hover:bg-white transition-all border-2 border-transparent hover:border-purple-300 shadow-lg"
              >
                <Checkbox
                  checked={selectedColumns.includes(idx)}
                  onCheckedChange={() => handleColumnToggle(idx)}
                  className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <span className="text-sm font-body font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">
                  {header}
                </span>
              </motion.label>
            ))}
          </div>
          
          {/* Percentage Input */}
          <div className="mb-8 max-w-md">
            <label className="block text-lg font-heading text-gray-900 mb-3">
              Ajuste de Preço (Opcional)
            </label>
            <div className="relative">
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="0"
                step="0.1"
                data-testid="percentage-input"
                className="w-full px-6 py-4 pr-12 text-lg font-mono font-semibold text-gray-900 bg-white border-2 border-purple-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-lg"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-purple-600">%</span>
            </div>
            <p className="mt-3 text-sm text-gray-600 font-body">
              <span className="font-semibold">Positivo:</span> aumenta o preço | 
              <span className="font-semibold ml-2">Negativo:</span> aplica desconto
            </p>
            <div className="mt-3 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPercentage(10)}
                className="px-4 py-2 text-sm font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                +10%
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPercentage(5)}
                className="px-4 py-2 text-sm font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                +5%
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPercentage(0)}
                className="px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                0%
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPercentage(-5)}
                className="px-4 py-2 text-sm font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                -5%
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPercentage(-10)}
                className="px-4 py-2 text-sm font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                -10%
              </motion.button>
            </div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              data-testid="process-button"
              onClick={handleProcess}
              disabled={isProcessing || selectedColumns.length === 0}
              className="bg-gradient-to-r from-[#00A0D9] to-[#66DFFF] hover:from-[#0090C9] hover:to-[#55CFEF] text-black h-14 px-10 rounded-2xl font-semibold font-body text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-3" />
                  Aplicar Arredondamento
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Status Badge */}
      {appState === 'download_ready' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex flex-wrap items-center gap-3 text-base"
        >
          <div className="flex items-center gap-3 bg-[#35E3B5] text-white px-6 py-3 rounded-2xl shadow-xl font-body font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Arredondamento aplicado em {selectedColumns.length} coluna{selectedColumns.length !== 1 ? 's' : ''}</span>
          </div>
          {percentage != 0 && (
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-xl font-body font-semibold ${
              percentage > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              <span>{percentage > 0 ? '+' : ''}{percentage}% {percentage > 0 ? 'de aumento' : 'de desconto'}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-strong rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto table-scroll">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-[#00A0D9] to-[#66DFFF]">
              <tr>
                {fileData.headers.map((header, idx) => (
                  <th
                    key={`header-${idx}-${header}`}
                    className={`p-5 text-left font-heading font-bold text-black whitespace-nowrap text-base ${
                      selectedColumns.includes(idx) ? 'bg-white/20' : ''
                    }`}
                  >
                    {header}
                    {selectedColumns.includes(idx) && (
                      <span className="ml-2 text-xs bg-white/30 px-2 py-1 rounded-full">(arredondado)</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white/50">
              {displayData && displayData.length > 0 ? (
                displayData.map((row, rowIdx) => (
                  <motion.tr
                    key={`row-${rowIdx}`}
                    data-testid={`data-row-${rowIdx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIdx * 0.05 }}
                    className="border-b border-purple-100 hover:bg-white/80 transition-all"
                  >
                    {Array.isArray(row) && row.map((cell, colIdx) => {
                      let displayValue = cell;
                      if (selectedColumns.includes(colIdx) && typeof cell === 'number' && cell < 1000 && appState === 'download_ready') {
                        displayValue = cell.toFixed(2);
                      } else if (cell !== null && cell !== undefined) {
                        displayValue = String(cell);
                      } else {
                        displayValue = '';
                      }
                      
                      return (
                        <td
                          key={`cell-${rowIdx}-${colIdx}`}
                          className={`p-5 font-mono text-black whitespace-nowrap ${
                            selectedColumns.includes(colIdx) ? 'bg-purple-50 font-bold' : ''
                          }`}
                        >
                          {displayValue}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={fileData.headers.length} className="p-8 text-center text-gray-500 font-body">
                    Nenhum dado disponível
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {fileData.row_count > 10 && (
          <div className="bg-gradient-to-r from-purple-100 to-emerald-100 px-6 py-4 text-center text-sm text-gray-700 font-body font-semibold">
            Mostrando as primeiras 10 linhas de {fileData.row_count} linhas totais
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DataPreview;