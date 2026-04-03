import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileSpreadsheet, AlertCircle, Zap } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FileUploader = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setError(null);
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setError('Por favor, envie um arquivo Excel (.xlsx, .xls) ou CSV (.csv)');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/upload-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUpload(response.data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Erro ao enviar arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <motion.h2 
          className="text-5xl sm:text-6xl lg:text-7xl font-heading text-white tracking-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Envie seu Arquivo Excel
        </motion.h2>
        <motion.p 
          className="text-xl text-white/90 max-w-3xl mx-auto font-body font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Aplique regras customizadas de arredondamento aos seus dados numéricos com precisão e controle ⚡
        </motion.p>
      </motion.div>

      {/* Rounding Rules Card - Versão Compacta */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-strong rounded-2xl p-6 max-w-3xl mx-auto shadow-2xl hover-lift"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-2 rounded-xl">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-heading text-gray-900">Regras de Arredondamento</h3>
        </div>
        <div className="space-y-3 font-body text-sm">
          <motion.div 
            whileHover={{ x: 5 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-transparent border-l-4 border-purple-500"
          >
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1 flex-shrink-0 animate-pulse"></div>
            <div>
              <span className="font-bold text-gray-900">Números &lt; 1.000:</span>
              <span className="text-gray-700 ml-1">Arredonda para X2.90, X4.90, X7.90 ou X9.90</span>
              <div className="mt-1 font-mono text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded inline-block">Ex: 853 → 852.90</div>
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ x: 5 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-blue-500"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div>
              <span className="font-bold text-gray-900">Números ≥ 1.000:</span>
              <span className="text-gray-700 ml-1">Arredonda para o valor terminando em 9</span>
              <div className="mt-1 font-mono text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded inline-block">Ex: 1.045 → 1.049</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Upload Zone */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div
          data-testid="file-upload-zone"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            glass-strong rounded-3xl p-16
            border-4 border-dashed transition-all duration-300
            ${isDragging
              ? 'border-emerald-500 bg-emerald-50/50 scale-105 border-animated'
              : 'border-purple-300 hover:border-purple-500 hover:bg-white/60'
            }
            ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            shadow-2xl hover:shadow-purple-500/20
          `}
        >
          <input
            data-testid="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            {isUploading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block bg-gradient-to-r from-purple-600 via-blue-500 to-green-500 rounded-full p-5 mb-6"
                >
                  <UploadCloud className="w-12 h-12 text-white" />
                </motion.div>
                <p className="text-lg font-semibold text-gray-700 font-body">Enviando...</p>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gradient-to-br from-purple-600 via-blue-500 to-green-500 rounded-3xl p-8 mb-6 glow-purple"
                >
                  {isDragging ? (
                    <FileSpreadsheet className="w-16 h-16 text-white" strokeWidth={1.5} />
                  ) : (
                    <UploadCloud className="w-16 h-16 text-white" strokeWidth={1.5} />
                  )}
                </motion.div>
                <p className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  Arraste seu arquivo Excel aqui
                </p>
                <p className="text-lg text-gray-600 mb-4 font-body">ou clique para selecionar</p>
                <p className="text-sm text-gray-500 bg-white/60 px-4 py-2 rounded-full font-body">Suporta arquivos .xlsx, .xls e .csv</p>
              </>
            )}
          </label>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            data-testid="upload-error" 
            className="mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-4 glass"
          >
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-base text-red-700 font-body font-medium">{error}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FileUploader;