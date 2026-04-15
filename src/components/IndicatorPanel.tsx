import React from 'react';
import { IndicatorSnapshot } from '../engine/predictionEngine';

interface IndicatorPanelProps {
  indicators: IndicatorSnapshot;
  currentPrice: number;
  decimals: number;
}

const IndicatorPanel: React.FC<IndicatorPanelProps> = ({ indicators, currentPrice, decimals }) => {
  const { rsi, macd, ema9, ema21, ema50, atr, fibonacci, marketStructure, volume } = indicators;

  const formatPrice = (p: number) => p.toFixed(decimals);

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-red-400';
    if (rsi < 30) return 'text-emerald-400';
    if (rsi > 55) return 'text-yellow-400';
    if (rsi < 45) return 'text-blue-400';
    return 'text-slate-300';
  };

  const getRSILabel = (rsi: number) => {
    if (rsi > 70) return 'SOBRECOMPRADO';
    if (rsi < 30) return 'SOBREVENDIDO';
    if (rsi > 55) return 'ALCISTA';
    if (rsi < 45) return 'BAJISTA';
    return 'NEUTRAL';
  };

  const getMADCLabel = () => {
    if (macd.crossover === 'bullish') return { label: 'CRUCE ALCISTA', color: 'text-emerald-400' };
    if (macd.crossover === 'bearish') return { label: 'CRUCE BAJISTA', color: 'text-red-400' };
    if (macd.histogram > 0) return { label: 'POSITIVO', color: 'text-emerald-400' };
    return { label: 'NEGATIVO', color: 'text-red-400' };
  };

  const macdInfo = getMADCLabel();

  const getEMALabel = () => {
    if (indicators.emaSignal === 'bullish_alignment') return { label: 'ALINEACIÓN ALCISTA', color: 'text-emerald-400' };
    if (indicators.emaSignal === 'bearish_alignment') return { label: 'ALINEACIÓN BAJISTA', color: 'text-red-400' };
    return { label: 'MIXTAS', color: 'text-yellow-400' };
  };

  const emaInfo = getEMALabel();

  const getStructureColor = () => {
    if (marketStructure.trend === 'bullish') return 'text-emerald-400';
    if (marketStructure.trend === 'bearish') return 'text-red-400';
    return 'text-yellow-400';
  };

  const fibNearPct = ((currentPrice - fibonacci.nearestLevelValue) / currentPrice * 100);

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* RSI */}
      <div className="bg-[#0d1220] border border-[#1e2a3a] rounded-lg p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">RSI (14)</span>
          <span className={`text-[9px] font-bold ${getRSIColor(rsi)}`}>{getRSILabel(rsi)}</span>
        </div>
        <div className={`text-xl font-black font-mono ${getRSIColor(rsi)}`}>
          {rsi.toFixed(1)}
        </div>
        {/* RSI Bar */}
        <div className="relative mt-1.5 h-1 bg-[#1e2a3a] rounded-full">
          <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-emerald-900/50 rounded-l-full" />
          <div className="absolute right-0 top-0 bottom-0 w-[30%] bg-red-900/50 rounded-r-full" />
          <div
            className={`absolute top-0 bottom-0 w-1.5 -translate-x-1/2 rounded-full ${getRSIColor(rsi).replace('text-', 'bg-')}`}
            style={{ left: `${rsi}%` }}
          />
          <div className="absolute left-[30%] top-0 bottom-0 w-px bg-slate-600" />
          <div className="absolute right-[30%] top-0 bottom-0 w-px bg-slate-600" />
        </div>
        <div className="flex justify-between text-[8px] text-slate-600 mt-0.5">
          <span>0</span><span>30</span><span>70</span><span>100</span>
        </div>
      </div>

      {/* MACD */}
      <div className="bg-[#0d1220] border border-[#1e2a3a] rounded-lg p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">MACD</span>
          <span className={`text-[9px] font-bold ${macdInfo.color}`}>{macdInfo.label}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <div className="text-[8px] text-slate-600">MACD</div>
            <div className={`text-xs font-mono font-bold ${macd.macd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {macd.macd >= 0 ? '+' : ''}{macd.macd.toFixed(5)}
            </div>
          </div>
          <div>
            <div className="text-[8px] text-slate-600">SEÑAL</div>
            <div className="text-xs font-mono text-slate-300">{macd.signal.toFixed(5)}</div>
          </div>
          <div>
            <div className="text-[8px] text-slate-600">HIST.</div>
            <div className={`text-xs font-mono font-bold ${macd.histogram >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {macd.histogram >= 0 ? '+' : ''}{macd.histogram.toFixed(5)}
            </div>
          </div>
        </div>
      </div>

      {/* EMAs */}
      <div className="bg-[#0d1220] border border-[#1e2a3a] rounded-lg p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">EMAs</span>
          <span className={`text-[9px] font-bold ${emaInfo.color}`}>{emaInfo.label}</span>
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-yellow-400 font-bold">EMA 9</span>
            <span className={`font-mono ${currentPrice > ema9 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatPrice(ema9)}
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-blue-400 font-bold">EMA 21</span>
            <span className={`font-mono ${currentPrice > ema21 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatPrice(ema21)}
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-purple-400 font-bold">EMA 50</span>
            <span className={`font-mono ${currentPrice > ema50 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatPrice(ema50)}
            </span>
          </div>
          <div className="flex justify-between text-[10px] pt-0.5 border-t border-[#1e2a3a]">
            <span className="text-slate-500">Precio</span>
            <span className="font-mono text-white font-bold">{formatPrice(currentPrice)}</span>
          </div>
        </div>
      </div>

      {/* ATR + Volume */}
      <div className="bg-[#0d1220] border border-[#1e2a3a] rounded-lg p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ATR + VOL</span>
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">ATR (14)</span>
            <span className="font-mono text-white">{formatPrice(atr)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Vol. Actual</span>
            <span className={`font-mono ${volume.ratio > 1.5 ? 'text-yellow-400' : 'text-slate-300'}`}>
              {volume.currentVolume.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Vol. Medio</span>
            <span className="font-mono text-slate-300">{Math.round(volume.averageVolume).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Ratio</span>
            <span className={`font-mono font-bold ${volume.ratio > 1.5 ? 'text-yellow-400' : volume.ratio < 0.5 ? 'text-red-400' : 'text-slate-300'}`}>
              {volume.ratio.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>

      {/* Market Structure */}
      <div className="bg-[#0d1220] border border-[#1e2a3a] rounded-lg p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estructura</span>
          <span className={`text-[9px] font-bold uppercase ${getStructureColor()}`}>
            {marketStructure.trend === 'bullish' ? 'ALCISTA' : marketStructure.trend === 'bearish' ? 'BAJISTA' : 'LATERAL'}
          </span>
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Patrón</span>
            <span className="text-slate-300 font-mono">{marketStructure.pattern}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Swing H</span>
            <span className="font-mono text-red-400">{formatPrice(marketStructure.swingHigh)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Swing L</span>
            <span className="font-mono text-emerald-400">{formatPrice(marketStructure.swingLow)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-400">Ruptura</span>
            <span className={`font-mono font-bold ${
              marketStructure.lastStructureBreak === 'up' ? 'text-emerald-400' :
              marketStructure.lastStructureBreak === 'down' ? 'text-red-400' : 'text-slate-500'
            }`}>
              {marketStructure.lastStructureBreak === 'up' ? '↑ ALCISTA' :
               marketStructure.lastStructureBreak === 'down' ? '↓ BAJISTA' : '— NINGUNA'}
            </span>
          </div>
        </div>
      </div>

      {/* Fibonacci */}
      <div className="bg-[#0d1220] border border-[#1e2a3a] rounded-lg p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fibonacci</span>
          <span className="text-[9px] font-bold text-yellow-400">Niv. {fibonacci.nearestLevel}</span>
        </div>
        <div className="space-y-0.5">
          {[
            { key: '0.786', val: fibonacci.level_786, color: 'text-blue-400' },
            { key: '0.618', val: fibonacci.level_618, color: 'text-emerald-400' },
            { key: '0.500', val: fibonacci.level_5, color: 'text-red-400' },
            { key: '0.382', val: fibonacci.level_382, color: 'text-orange-400' },
            { key: '0.236', val: fibonacci.level_236, color: 'text-yellow-400' },
          ].map(({ key, val, color }) => (
            <div key={key} className="flex justify-between text-[10px]">
              <span className={`${color} font-bold`}>{key}</span>
              <span className={`font-mono ${
                Math.abs(currentPrice - val) < atr * 0.5 ? 'text-yellow-300 font-bold' : 'text-slate-400'
              }`}>
                {formatPrice(val)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-1 pt-1 border-t border-[#1e2a3a] flex justify-between text-[9px]">
          <span className="text-slate-600">Distancia al nivel</span>
          <span className={`font-mono ${Math.abs(fibNearPct) < 0.1 ? 'text-yellow-400' : 'text-slate-500'}`}>
            {fibNearPct >= 0 ? '+' : ''}{fibNearPct.toFixed(3)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default IndicatorPanel;
