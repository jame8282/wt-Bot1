import React, { useState, useMemo } from 'react';
import { Search, Radar, Clock, ChevronDown } from 'lucide-react';
import { useTradingStore } from '../store/tradingStore';
import { QUOTEX_ASSETS } from '../data/quotexAssets';
import { scannerPredict } from '../engine/predictionEngine';
import { CandlePrediction } from '../engine/predictionEngine';
import PredictionCards from './PredictionCards';

const Scanner: React.FC = () => {
  const { assetStates, scannerAssetId, scannerTime, scannerTimezone, setScannerAsset, setScannerTime, setScannerTimezone } = useTradingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [scanResult, setScanResult] = useState<CandlePrediction[] | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const filteredAssets = useMemo(() => {
    return QUOTEX_ASSETS.filter(a =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const selectedAsset = QUOTEX_ASSETS.find(a => a.id === scannerAssetId);

  const handleScan = () => {
    if (!scannerTime || !scannerAssetId) return;
    
    setIsScanning(true);
    
    // Parse target time
    const [hours, minutes] = scannerTime.split(':').map(Number);
    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);
    
    // If time is in the past, use next day
    if (targetDate.getTime() < now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    const state = assetStates[scannerAssetId];
    
    setTimeout(() => {
      if (state?.candles && state.candles.length > 0) {
        const results = scannerPredict(
          scannerAssetId,
          state.candles,
          state.lastPrice,
          targetDate,
          scannerTimezone
        );
        setScanResult(results);
      }
      setIsScanning(false);
    }, 800);
  };

  const timezoneOptions = Array.from({ length: 13 }, (_, i) => i - 6);

  const formatTime = (date: Date) => {
    const adjusted = new Date(date.getTime() + scannerTimezone * 60 * 60 * 1000);
    return adjusted.toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
  };

  return (
    <div className="bg-[#0a0e1a] border border-[#1e2a3a] rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-700/40">
          <Radar className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">SCANNER AVANZADO</h3>
          <p className="text-[10px] text-slate-500">Predicción para hora específica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4">
        {/* Asset Selector */}
        <div>
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">
            Activo
          </label>
          <div className="relative">
            {/* Search input */}
            <div className="relative flex items-center gap-2 mb-1">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar activo..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-[#131b2e] border border-[#1e2a3a] rounded text-xs text-slate-300 pl-7 pr-3 py-1.5 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-[#131b2e] border border-[#1e2a3a] rounded px-2 py-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Selected asset display */}
            {selectedAsset && (
              <div className="flex items-center gap-2 px-2 py-1 bg-purple-900/20 border border-purple-700/30 rounded text-xs">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-purple-300 font-medium">{selectedAsset.name}</span>
              </div>
            )}

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute z-50 w-full bg-[#131b2e] border border-[#1e2a3a] rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar mt-1">
                {filteredAssets.slice(0, 30).map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setScannerAsset(a.id);
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-purple-900/20 transition-colors border-b border-[#1e2a3a]/50 ${
                      a.id === scannerAssetId ? 'text-purple-300 bg-purple-900/20' : 'text-slate-300'
                    }`}
                  >
                    <div className="font-medium">{a.name}</div>
                    <div className="text-[9px] text-slate-600">{a.category.toUpperCase()} · Pago: {a.payout}%</div>
                  </button>
                ))}
                {filteredAssets.length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-500 text-center">Sin resultados</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Time + Timezone Row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Target Time */}
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">
              <Clock className="w-3 h-3 inline mr-1" />
              Hora objetivo
            </label>
            <input
              type="time"
              value={scannerTime}
              onChange={e => setScannerTime(e.target.value)}
              className="w-full bg-[#131b2e] border border-[#1e2a3a] rounded text-xs text-slate-300 px-2 py-1.5 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">
              Zona Horaria
            </label>
            <select
              value={scannerTimezone}
              onChange={e => setScannerTimezone(Number(e.target.value))}
              className="w-full bg-[#131b2e] border border-[#1e2a3a] rounded text-xs text-slate-300 px-2 py-1.5 focus:outline-none focus:border-purple-500/50 transition-colors"
            >
              {timezoneOptions.map(tz => (
                <option key={tz} value={tz}>
                  {tz >= 0 ? `+${tz}` : tz} UTC
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scan Button */}
        <button
          onClick={handleScan}
          disabled={!scannerTime || !scannerAssetId || isScanning}
          className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            isScanning
              ? 'bg-purple-900/50 text-purple-400 cursor-not-allowed'
              : !scannerTime || !scannerAssetId
              ? 'bg-[#131b2e] text-slate-600 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-lg shadow-purple-900/30'
          }`}
        >
          {isScanning ? (
            <>
              <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Radar className="w-4 h-4" />
              ESCANEAR MERCADO
            </>
          )}
        </button>
      </div>

      {/* Scanner Results */}
      {scanResult && scanResult.length > 0 && (
        <div className="border-t border-[#1e2a3a] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resultado del Scan</h4>
            <span className="text-[10px] text-purple-400 font-mono">
              {selectedAsset?.name}
            </span>
          </div>

          {/* Time sequence preview */}
          <div className="flex items-center gap-1 mb-3 text-[10px] text-slate-500 font-mono">
            {scanResult.map((p, i) => (
              <React.Fragment key={i}>
                <span className={`px-1.5 py-0.5 rounded ${p.direction === 'COMPRA' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                  {formatTime(p.timeStart)}
                </span>
                {i < 2 && <span>→</span>}
              </React.Fragment>
            ))}
          </div>

          <PredictionCards
            predictions={scanResult}
            timezoneOffset={scannerTimezone}
            compact={true}
          />
        </div>
      )}
    </div>
  );
};

export default Scanner;
