import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Wifi, SlidersHorizontal } from 'lucide-react';
import { useTradingStore, getSortedAssets } from '../store/tradingStore';
import { CATEGORY_LABELS } from '../data/quotexAssets';
import MiniSparkline from './MiniSparkline';

const AssetList: React.FC = () => {
  const { assets, assetStates, selectedAssetId, selectAsset } = useTradingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);

  const sortedAssets = useMemo(
    () => getSortedAssets(assets, assetStates),
    [assets, assetStates]
  );

  const filtered = useMemo(() => {
    return sortedAssets.filter(a => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [sortedAssets, searchQuery, categoryFilter]);

  const categories = ['all', 'forex', 'crypto', 'commodity', 'stock', 'index'];

  const getProbabilityColor = (prob: number) => {
    if (prob >= 82) return 'text-emerald-300';
    if (prob >= 70) return 'text-emerald-400';
    if (prob >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getRowBg = (prob: number, isSelected: boolean) => {
    if (isSelected)
      return 'bg-blue-900/30 border-l-2 border-l-blue-500';
    if (prob >= 80)
      return 'border-l-2 border-l-emerald-700/50 hover:bg-emerald-900/10';
    if (prob >= 65)
      return 'border-l-2 border-l-yellow-700/30 hover:bg-yellow-900/10';
    return 'border-l-2 border-l-transparent hover:bg-white/5';
  };

  const catColors: Record<string, string> = {
    forex: 'text-blue-400 bg-blue-900/30',
    crypto: 'text-purple-400 bg-purple-900/30',
    commodity: 'text-yellow-400 bg-yellow-900/30',
    stock: 'text-green-400 bg-green-900/30',
    index: 'text-orange-400 bg-orange-900/30',
  };

  // Stats
  const totalBuy = sortedAssets.filter(a => assetStates[a.id]?.analysis?.direction === 'COMPRA').length;
  const totalSell = sortedAssets.length - totalBuy;

  return (
    <div className="flex flex-col h-full bg-[#080c18] border-r border-[#1e2a3a]">
      {/* Header */}
      <div className="p-3 border-b border-[#1e2a3a] flex-shrink-0">
        {/* Title row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-black text-white uppercase tracking-widest">
              Activos Quotex
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`p-1 rounded transition-colors ${showFilter ? 'text-blue-400 bg-blue-900/20' : 'text-slate-500 hover:text-white'}`}
            >
              <SlidersHorizontal className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Market sentiment */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex-1 bg-[#0d1220] rounded-full overflow-hidden h-1.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(totalBuy / Math.max(1, sortedAssets.length)) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-emerald-400 font-mono w-6 text-right">{totalBuy}↑</span>
          <span className="text-[9px] text-red-400 font-mono w-6">{totalSell}↓</span>
        </div>

        {/* Search */}
        <div className="relative mb-1.5">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar activo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1220] border border-[#1e2a3a] rounded text-[11px] text-slate-300 pl-7 pr-3 py-1.5 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Category Filter */}
        {showFilter && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-[9px] px-1.5 py-0.5 rounded transition-colors font-bold ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0d1220] text-slate-500 hover:text-slate-300 border border-[#1e2a3a]'
                }`}
              >
                {cat === 'all' ? 'TODOS' : CATEGORY_LABELS[cat]?.toUpperCase() || cat.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Column Headers */}
      <div className="px-2 py-1 border-b border-[#1e2a3a] flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] text-slate-600 uppercase tracking-wider">
          Activo ({filtered.length})
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-600">Spark</span>
          <span className="text-[9px] text-slate-600 w-10 text-right">%Prob</span>
        </div>
      </div>

      {/* Asset List */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.map((asset, idx) => {
            const state = assetStates[asset.id];
            const analysis = state?.analysis;
            const isSelected = asset.id === selectedAssetId;
            const prob = analysis?.probability || 50;
            const direction = analysis?.direction || 'COMPRA';
            const priceChange = analysis?.priceChangePercent || 0;
            const priceHistory = state?.priceHistory || [];

            const sparkColor = direction === 'COMPRA' ? '#10b981' : '#ef4444';

            return (
              <button
                key={asset.id}
                onClick={() => selectAsset(asset.id)}
                className={`w-full text-left px-2 py-1.5 border-b border-[#1e2a3a]/40 transition-all ${getRowBg(prob, isSelected)}`}
              >
                <div className="flex items-center justify-between gap-1">
                  {/* Left: rank + icon + name */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-[9px] text-slate-700 font-mono w-3 flex-shrink-0">
                      {idx + 1}
                    </span>
                    {direction === 'COMPRA' ? (
                      <TrendingUp className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className={`text-[11px] font-semibold truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {asset.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[8px] px-1 rounded font-bold ${catColors[asset.category] || 'text-slate-400'}`}>
                          {asset.category.slice(0, 3).toUpperCase()}
                        </span>
                        <span className={`text-[9px] font-mono ${priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: sparkline + probability */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {priceHistory.length >= 2 && (
                      <MiniSparkline
                        data={priceHistory}
                        width={40}
                        height={16}
                        color={sparkColor}
                      />
                    )}
                    <div className="text-right">
                      <div className={`text-sm font-black font-mono leading-tight ${getProbabilityColor(prob)}`}>
                        {prob.toFixed(0)}%
                      </div>
                      <div className={`text-[8px] font-bold leading-tight ${
                        analysis?.quality === 'A' ? 'text-emerald-400' :
                        analysis?.quality === 'B' ? 'text-yellow-400' : 'text-orange-400'
                      }`}>
                        {analysis?.quality || 'C'}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-600 text-xs">
              Sin resultados para "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-[#1e2a3a] flex-shrink-0">
        <div className="text-[9px] text-slate-600 text-center">
          ↓ ordenado por probabilidad · M5 · Quotex
        </div>
      </div>
    </div>
  );
};

export default AssetList;
