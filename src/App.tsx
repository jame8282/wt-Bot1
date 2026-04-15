import React, { useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import AssetList from './components/AssetList';
import MainPanel from './components/MainPanel';
import Scanner from './components/Scanner';
import { useTradingStore } from './store/tradingStore';
import { Brain, ChevronLeft, ChevronRight, Radar } from 'lucide-react';

const TICK_INTERVAL = 2000; // 2 seconds

const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 bg-[#060a14] flex items-center justify-center z-50">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-900/50">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl animate-pulse" />
      </div>
      <h1 className="text-2xl font-black text-white mb-2 tracking-wide">
        HEDGE FUND AI
      </h1>
      <p className="text-blue-400 text-sm font-bold tracking-widest uppercase mb-6">Trading Engine</p>
      <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-4">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>Inicializando motor de IA...</span>
      </div>
      <div className="space-y-1 text-xs text-slate-600">
        <div className="animate-pulse">Cargando 79 activos de Quotex...</div>
        <div className="animate-pulse delay-200">Generando velas M5 históricas...</div>
        <div className="animate-pulse delay-500">Calibrando indicadores RSI · MACD · Fibonacci...</div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const { initializeAssets, tick, isRunning } = useTradingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Initialize with slight delay for loading screen
    const initTimer = setTimeout(() => {
      initializeAssets();
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(initTimer);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    tickRef.current = setInterval(() => {
      tick();
    }, TICK_INTERVAL);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isRunning, tick]);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="h-screen flex flex-col bg-[#060a14] text-white overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#131b2e',
            color: '#fff',
            border: '1px solid #1e2a3a',
            fontSize: '12px',
          },
        }}
      />

      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Asset List */}
        <div
          className={`flex-shrink-0 transition-all duration-300 overflow-hidden ${
            sidebarCollapsed ? 'w-0' : 'w-[220px]'
          }`}
        >
          <AssetList />
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex-shrink-0 w-4 bg-[#0d1220] border-x border-[#1e2a3a] flex items-center justify-center text-slate-600 hover:text-white hover:bg-[#131b2e] transition-colors z-10"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* CENTER: Main Panel */}
        <div className="flex-1 overflow-hidden">
          <MainPanel />
        </div>

        {/* RIGHT: Scanner Panel Toggle */}
        <button
          onClick={() => setShowScanner(!showScanner)}
          className="flex-shrink-0 w-4 bg-[#0d1220] border-x border-[#1e2a3a] flex items-center justify-center text-slate-600 hover:text-purple-400 hover:bg-[#131b2e] transition-colors z-10"
        >
          {showScanner ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* RIGHT: Scanner Panel */}
        <div
          className={`flex-shrink-0 transition-all duration-300 overflow-hidden ${
            showScanner ? 'w-[320px]' : 'w-0'
          }`}
        >
          <div className="h-full overflow-y-auto custom-scrollbar p-3 border-l border-[#1e2a3a] bg-[#080c18]">
            <Scanner />
          </div>
        </div>
      </div>

      {/* Scanner Floating Button (mobile) */}
      <button
        onClick={() => setShowScanner(!showScanner)}
        className="fixed bottom-4 right-4 md:hidden z-20 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-900/50 hover:bg-purple-500 transition-colors"
      >
        <Radar className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};

export default App;
