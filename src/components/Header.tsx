import React, { useState, useEffect } from 'react';
import { Brain, Wifi, Clock, Activity } from 'lucide-react';
import { useTradingStore } from '../store/tradingStore';

const Header: React.FC = () => {
  const { timezoneOffset, setTimezoneOffset, lastGlobalUpdate, assets } = useTradingStore();
  const tzOptions = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
  const [tick, setTick] = useState(0);

  // Force re-render every second for live clock
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const getAdjustedTime = () => {
    const now = new Date();
    const adjusted = new Date(now.getTime() + timezoneOffset * 60 * 60 * 1000);
    return adjusted.toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
  };

  const getAdjustedDate = () => {
    const now = new Date();
    const adjusted = new Date(now.getTime() + timezoneOffset * 60 * 60 * 1000);
    return adjusted.toLocaleDateString('es', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      timeZone: 'UTC',
    });
  };

  // Suppress unused tick warning
  void tick;

  return (
    <header className="flex-shrink-0 bg-[#060a14] border-b border-[#1e2a3a] px-4 py-2 flex items-center justify-between z-10 shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse border border-[#060a14]" />
        </div>
        <div>
          <div className="text-[12px] font-black text-white tracking-[0.1em] uppercase leading-tight">
            Hedge Fund AI
          </div>
          <div className="text-[9px] font-bold text-blue-400 tracking-[0.2em] uppercase leading-tight">
            Trading Engine · v2.0
          </div>
        </div>

        {/* Live Badge */}
        <div className="hidden md:flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-emerald-900/20 border border-emerald-700/30 rounded-full">
          <Wifi className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
          <span className="text-[9px] text-emerald-400 font-bold tracking-wide">QUOTEX · EN VIVO</span>
        </div>
      </div>

      {/* Center - System Stats */}
      <div className="hidden lg:flex items-center gap-1">
        <div className="flex items-center gap-4 px-4 py-1.5 bg-[#0d1220] border border-[#1e2a3a] rounded-lg">
          <div className="text-center">
            <div className="text-[9px] text-slate-600 uppercase tracking-wider">Activos</div>
            <div className="text-xs font-bold text-white">{assets.length}</div>
          </div>
          <div className="w-px h-6 bg-[#1e2a3a]" />
          <div className="text-center">
            <div className="text-[9px] text-slate-600 uppercase tracking-wider">Marco</div>
            <div className="text-xs font-bold text-blue-400">M5</div>
          </div>
          <div className="w-px h-6 bg-[#1e2a3a]" />
          <div className="text-center">
            <div className="text-[9px] text-slate-600 uppercase tracking-wider">Indicadores</div>
            <div className="text-[9px] font-bold text-purple-400">RSI·MACD·EMA·ATR·FIB</div>
          </div>
          <div className="w-px h-6 bg-[#1e2a3a]" />
          <div className="text-center">
            <div className="text-[9px] text-slate-600 uppercase tracking-wider">Motor</div>
            <div className="flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-400 font-mono">
                {lastGlobalUpdate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Time + Timezone */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden sm:flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="text-base font-black font-mono text-white tabular-nums tracking-wide">
              {getAdjustedTime()}
            </span>
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            {getAdjustedDate()} · UTC{timezoneOffset >= 0 ? '+' : ''}{timezoneOffset}
          </div>
        </div>

        {/* Timezone Selector */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[8px] text-slate-600 uppercase tracking-wider">Zona Horaria</span>
          <div className="flex items-center gap-0.5 bg-[#0d1220] border border-[#1e2a3a] rounded-lg p-0.5">
            {tzOptions.map(tz => (
              <button
                key={tz}
                onClick={() => setTimezoneOffset(tz)}
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all min-w-[22px] ${
                  timezoneOffset === tz
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {tz >= 0 ? `+${tz}` : tz}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
