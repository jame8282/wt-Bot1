import React from 'react';
import { TrendingUp, TrendingDown, Clock, Shield, Star, AlertTriangle } from 'lucide-react';
import { CandlePrediction } from '../engine/predictionEngine';

interface PredictionCardsProps {
  predictions: CandlePrediction[];
  timezoneOffset: number;
  compact?: boolean;
}

const PredictionCards: React.FC<PredictionCardsProps> = ({ predictions, timezoneOffset, compact = false }) => {
  const formatTime = (date: Date) => {
    const adjusted = new Date(date.getTime() + timezoneOffset * 60 * 60 * 1000);
    return adjusted.toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
  };

  const getRiskIcon = (risk: string) => {
    if (risk === 'BAJO') return <Shield className="w-3 h-3 text-emerald-400" />;
    if (risk === 'MEDIO') return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
    return <AlertTriangle className="w-3 h-3 text-red-400" />;
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'BAJO') return 'text-emerald-400 bg-emerald-900/30 border-emerald-700/40';
    if (risk === 'MEDIO') return 'text-yellow-400 bg-yellow-900/30 border-yellow-700/40';
    return 'text-red-400 bg-red-900/30 border-red-700/40';
  };

  const getQualityColor = (q: string) => {
    if (q === 'A') return 'text-emerald-300 bg-emerald-900/40 border-emerald-600/50';
    if (q === 'B') return 'text-yellow-300 bg-yellow-900/40 border-yellow-600/50';
    return 'text-orange-300 bg-orange-900/40 border-orange-600/50';
  };

  const getQualityLabel = (q: string) => {
    if (q === 'A') return 'Alta Calidad';
    if (q === 'B') return 'Calidad Media';
    return 'Calidad Baja';
  };

  const getProbabilityGradient = (dir: string, _prob: number) => {
    if (dir === 'COMPRA') {
      return `from-emerald-900/80 via-emerald-900/40 to-transparent`;
    }
    return `from-red-900/80 via-red-900/40 to-transparent`;
  };

  if (predictions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
        Cargando predicciones...
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-${compact ? '2' : '3'}`}>
      {predictions.map((pred) => {
        const isCompra = pred.direction === 'COMPRA';
        const probPercent = pred.probability;

        return (
          <div
            key={pred.candleNumber}
            className={`relative overflow-hidden rounded-xl border ${compact ? 'p-3' : 'p-4'} transition-all duration-300 ${
              isCompra
                ? 'border-emerald-600/50 bg-gradient-to-b from-emerald-900/30 to-[#0a0e1a]'
                : 'border-red-600/50 bg-gradient-to-b from-red-900/30 to-[#0a0e1a]'
            }`}
          >
            {/* Glowing top border */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${isCompra ? 'bg-emerald-500' : 'bg-red-500'}`} />

            {/* Background gradient fill based on probability */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${getProbabilityGradient(pred.direction, probPercent)} opacity-30 pointer-events-none`}
            />

            {/* Candle Number Badge */}
            <div className="relative flex items-center justify-between mb-3">
              <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} font-bold text-slate-400`}>
                <Clock className="w-3 h-3" />
                <span>Vela {pred.candleNumber}</span>
              </div>
              <div className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${getQualityColor(pred.quality)}`}>
                {pred.quality} · {getQualityLabel(pred.quality)}
              </div>
            </div>

            {/* Time Range */}
            <div className="relative mb-3 text-center">
              <div className="text-[11px] text-slate-500 font-mono">
                {formatTime(pred.timeStart)} → {formatTime(pred.timeEnd)}
              </div>
            </div>

            {/* Direction - MAIN ELEMENT */}
            <div className="relative text-center mb-3">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-black text-lg ${
                isCompra
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                {isCompra ? (
                  <TrendingUp className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />
                ) : (
                  <TrendingDown className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />
                )}
                <span className={compact ? 'text-lg' : 'text-xl'}>{pred.direction}</span>
              </div>
            </div>

            {/* Probability */}
            <div className="relative mb-3">
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className={`font-black font-mono ${compact ? 'text-2xl' : 'text-3xl'} ${isCompra ? 'text-emerald-400' : 'text-red-400'}`}>
                  {probPercent.toFixed(1)}
                </span>
                <span className={`text-lg font-bold mb-0.5 ${isCompra ? 'text-emerald-500' : 'text-red-500'}`}>%</span>
              </div>
              <div className="text-center text-[10px] text-slate-500">PROBABILIDAD</div>

              {/* Probability bar */}
              <div className="mt-2 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isCompra
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                      : 'bg-gradient-to-r from-red-600 to-red-400'
                  }`}
                  style={{ width: `${probPercent}%` }}
                />
              </div>
            </div>

            {/* Risk Badge */}
            <div className="relative flex items-center justify-center">
              <div className={`flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-full border font-bold uppercase ${getRiskColor(pred.risk)}`}>
                {getRiskIcon(pred.risk)}
                <span>Riesgo {pred.risk}</span>
              </div>
            </div>

            {/* Stars for quality A */}
            {pred.quality === 'A' && (
              <div className="relative flex justify-center gap-0.5 mt-2">
                {[1,2,3].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
              </div>
            )}

            {/* Pulsing dot for live */}
            {pred.candleNumber === 1 && (
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isCompra ? 'bg-emerald-400' : 'bg-red-400'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PredictionCards;
