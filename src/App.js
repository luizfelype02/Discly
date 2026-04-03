import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@/App.css';
import FileUploader from '@/components/FileUploader';
import DataPreview from '@/components/DataPreview';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState('idle');
  const [fileData, setFileData] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const handleFileUpload = (data) => {
    setFileData(data);
    setAppState('preview');
    setSelectedColumns([]);
    toast.success('Arquivo enviado com sucesso! 🎉');
  };

  const handleReset = () => {
    setAppState('idle');
    setFileData(null);
    setPreviewData(null);
    setSelectedColumns([]);
  };

  const handleProcessComplete = (data) => {
    setPreviewData(data);
    setAppState('download_ready');
  };

  return (
    <div className="App min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated circles in background */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
      
      <div className="relative z-10">
        {/* Header with Glassmorphism */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="glass border-b border-white/30"
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-600 via-blue-500 to-green-500 p-3 rounded-2xl float-animation">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-heading text-gray-900 tracking-tight">Discly</h1>
                  <p className="text-sm text-gray-600 font-body">Arredondamento inteligente de dados</p>
                </div>
              </div>
              {appState !== 'idle' && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="reset-button"
                  onClick={handleReset}
                  className="px-6 py-2.5 text-sm font-semibold font-body text-purple-700 bg-white/80 rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-xl"
                >
                  Recomeçar
                </motion.button>
              )}
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <AnimatePresence mode="wait">
            {appState === 'idle' && (
              <motion.div
                key="uploader"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <FileUploader onUpload={handleFileUpload} />
              </motion.div>
            )}

            {(appState === 'preview' || appState === 'download_ready') && fileData && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <DataPreview
                  fileData={fileData}
                  previewData={previewData}
                  selectedColumns={selectedColumns}
                  setSelectedColumns={setSelectedColumns}
                  appState={appState}
                  onProcessComplete={handleProcessComplete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;