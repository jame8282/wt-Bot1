import React, { useMemo, lazy, Suspense } from 'react';
import {
  TrendingUp, TrendingDown, Activity, RefreshCw,
  Star, AlertTriangle, Shield, BarChart2, Zap, Target
} from 'lucide-react';
import { useTradingStore } from '../store/tradingStore';
import { QUOTEX_ASSETS } from '../data/quotexAssets';
import { calculateEMA } from '../engine/indicators';
import IndicatorPanel from './IndicatorPanel';
import PredictionCards from './PredictionCards';

const CandleChart = lazy(() => import('./CandleChart'));

const MainPanel: React.FC = () => {
  const { selectedAssetId, assetStates, timezoneOffset, fullRefresh } = useTradingStore();

  const asset = QUOTEX_ASSETS.find(a => a.id === selectedAssetId);
  const state = assetStates[selectedAssetId];
  const analysis = state?.analysis;

  const ema9Values = useMemo(() => {
    if (!state?.candles) return [];
    return calculateEMA(state.candles, 9);
  }, [state?.candles]);

  const ema21Values = useMemo(() => {
    if (!state?.candles) return [];
    return calculateEMA(state.candles, 21);
  }, [state?.candles]);

  const ema50Values = useMemo(() => {
    if (!state?.candles) return [];
    return calculateEMA(state.candles, 50);
  }, [state?.candles]);

  if (!asset || !analysis) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 bg-[#0a0e1a]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Inicializando motor de análisis...</p>
          <p className="text-xs text-slate-600 mt-1">Por favor espere</p>
        </div>
      </div>
    );
  }

  const isCompra = analysis.direction === 'COMPRA';
  const priceUp = analysis.priceChangePercent >= 0;

  const formatPrice = (p: number) => p.toFixed(asset.decimals);

  const getQualityStars = (q: string) => {
    if (q === 'A') return 3;
    if (q === 'B') return 2;
    return 1;
  };

  const getRiskBadge = (risk: string) => {
    const configs = {
      BAJO: { icon: <Shield className="w-3.5 h-3.5" />, color: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/40' },
      MEDIO: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/40' },
      ALTO: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-red-400 bg-red-900/30 border-red-700/40' },
    };
    return configs[risk as keyof typeof configs] || configs.MEDIO;
  };

  const riskBadge = getRiskBadge(analysis.risk);

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-[#090d1a]">
      {/* ==========================================
          ASSET HEADER
      ========================================== */}
      <div className={`flex-shrink-0 relative overflow-hidden border-b border-[#1e2a3a] ${
        isCompra
          ? 'bg-gradient-to-br from-emerald-950/60 via-[#090d1a] to-[#090d1a]'
          : 'bg-gradient-to-br from-red-950/60 via-[#090d1a] to-[#090d1a]'
      }`}>
        {/* Decorative glow */}
        <div className={`absolute top-0 left-0 right-0 h-px ${isCompra ? 'bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent' : 'bg-gradient-to-r from-transparent via-red-500/50 to-transparent'}`} />

        <div className="p-4">
          {/* Asset name row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-black text-white">{asset.name}</h2>
                {asset.isOTC && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border text-orange-400 border-orange-700/40 bg-orange-900/20">
                    OTC
                  </span>
                )}
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                  asset.category === 'forex' ? 'text-blue-400 border-blue-700/40 bg-blue-900/20' :
                  asset.category === 'crypto' ? 'text-purple-400 border-purple-700/40 bg-purple-900/20' :
                  asset.category === 'commodity' ? 'text-yellow-400 border-yellow-700/40 bg-yellow-900/20' :
                  asset.category === 'stock' ? 'text-green-400 border-green-700/40 bg-green-900/20' :
                  'text-orange-400 border-orange-700/40 bg-orange-900/20'
                }`}>
                  {asset.category.toUpperCase()}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border text-slate-400 border-slate-700/40 bg-slate-900/20">
                  M5 · 24/7
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white tabular-nums">
                  {formatPrice(analysis.currentPrice)}
                </span>
                <span className={`flex items-center gap-1 text-sm font-bold ${priceUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {priceUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {priceUp ? '+' : ''}{analysis.priceChange.toFixed(asset.decimals)}
                </span>
                <span className={`text-sm font-bold ${priceUp ? 'text-emerald-500' : 'text-red-500'}`}>
                  ({priceUp ? '+' : ''}{analysis.priceChangePercent.toFixed(3)}%)
                </span>
              </div>
            </div>

            {/* Main Signal Badge */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              {/* Direction */}
              <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-2xl border shadow-xl transition-all ${
                isCompra
                  ? 'text-emerald-200 bg-emerald-900/50 border-emerald-500/60 shadow-emerald-900/30'
                  : 'text-red-200 bg-red-900/50 border-red-500/60 shadow-red-900/30'
              }`}>
                {isCompra
                  ? <TrendingUp className="w-7 h-7 text-emerald-400" />
                  : <TrendingDown className="w-7 h-7 text-red-400" />
                }
                <span>{analysis.direction}</span>
              </div>

              {/* Probability + Quality */}
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className={`text-2xl font-black font-mono ${isCompra ? 'text-emerald-400' : 'text-red-400'}`}>
                    {analysis.probability.toFixed(1)}%
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">Probabilidad</div>
                </div>
                <div className="text-center">
                  <div className="flex gap-0.5 mb-0.5">
                    {Array.from({ length: getQualityStars(analysis.quality) }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    ))}
                    {Array.from({ length: 3 - getQualityStars(analysis.quality) }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-slate-700" />
                    ))}
                  </div>
                  <div className={`text-[10px] font-black ${
                    analysis.quality === 'A' ? 'text-emerald-400' :
                    analysis.quality === 'B' ? 'text-yellow-400' : 'text-orange-400'
                  }`}>
                    CALIDAD {analysis.quality}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Risk */}
            <div className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border font-bold ${riskBadge.color}`}>
              {riskBadge.icon}
              <span>Riesgo {analysis.risk}</span>
            </div>
            {/* Payout */}
            <div className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border text-blue-400 border-blue-700/40 bg-blue-900/20 font-bold">
              <Zap className="w-3 h-3" />
              <span>Pago {asset.payout}%</span>
            </div>
            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold">EN VIVO</span>
            </div>
            {/* Summary */}
            <div className="flex items-start gap-1.5 flex-1 min-w-0">
              <Activity className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed truncate">{analysis.summary}</p>
              <button
                onClick={fullRefresh}
                className="flex-shrink-0 p-0.5 text-slate-600 hover:text-white transition-colors"
                title="Actualizar análisis"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          3 FUTURE CANDLES PREDICTION - MAIN BLOCK
      ========================================== */}
      <div className="flex-shrink-0 p-4 border-b border-[#1e2a3a]">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-900/30 rounded-lg border border-blue-700/30">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                🔮 PREDICCIÓN · 3 VELAS FUTURAS M5
              </h3>
              <p className="text-[9px] text-slate-500">
                Cada vela es independiente · No son certezas, son probabilidades
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-600 font-mono">Actualizado</div>
            <div className="text-[10px] text-emerald-400 font-mono font-bold">
              {analysis.lastUpdated.toLocaleTimeString('es', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* The 3 Prediction Cards */}
        <PredictionCards
          predictions={analysis.predictions}
          timezoneOffset={timezoneOffset}
        />

        {/* Disclaimer */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-slate-600">
          <AlertTriangle className="w-3 h-3" />
          <span>Las predicciones son probabilísticas. No garantizan resultados. Gestione el riesgo siempre.</span>
        </div>
      </div>

      {/* ==========================================
          INDICATOR ANALYSIS
      ========================================== */}
      <div className="flex-shrink-0 p-4 border-b border-[#1e2a3a]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-purple-900/30 rounded-lg border border-purple-700/30">
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Análisis de Indicadores
            </h3>
            <p className="text-[9px] text-slate-500">RSI · MACD · EMA 9/21/50 · ATR · Volumen · Fibonacci · Estructura</p>
          </div>
        </div>
        <IndicatorPanel
          indicators={analysis.indicators}
          currentPrice={analysis.currentPrice}
          decimals={asset.decimals}
        />
      </div>

      {/* ==========================================
          M5 CANDLESTICK CHART
      ========================================== */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-800/50 rounded-lg border border-[#1e2a3a]">
              <BarChart2 className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Gráfico Velas M5 · {asset.name}
              </h3>
              <p className="text-[9px] text-slate-600">Tiempo real · Soporte/Resistencia · EMA · Fibonacci</p>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 text-[9px] text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-yellow-400 inline-block rounded" />
              EMA9
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-blue-400 inline-block rounded" />
              EMA21
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-purple-400 inline-block rounded" />
              EMA50
            </span>
          </div>
        </div>

        <div className="h-[300px] rounded-xl overflow-hidden border border-[#1e2a3a] shadow-xl">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full bg-[#0a0e1a] text-slate-500 text-sm gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Cargando gráfico...
            </div>
          }>
            {state?.candles && (
              <CandleChart
                candles={state.candles}
                ema9={ema9Values}
                ema21={ema21Values}
                ema50={ema50Values}
                fibonacci={analysis.indicators.fibonacci}
              />
            )}
          </Suspense>
        </div>

        {/* Chart Footer */}
        <div className="flex items-center justify-between mt-1.5 text-[9px] text-slate-600">
          <span>↔ Arrastrar para desplazar · ⚲ Rueda para zoom</span>
          <span className="font-mono">{state?.candles?.length || 0} velas M5</span>
        </div>
      </div>
    </div>
  );
};

export default MainPanel;
