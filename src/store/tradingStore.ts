import { create } from 'zustand';
import { QUOTEX_ASSETS, QuotexAsset } from '../data/quotexAssets';
import { Candle, generateHistoricalCandles, updateCandle, generateNewCandle } from '../engine/marketSimulator';
import { AssetAnalysis, analyzeAsset } from '../engine/predictionEngine';

interface AssetState {
  candles: Candle[];
  analysis: AssetAnalysis | null;
  lastPrice: number;
  priceHistory: number[];
}

interface TradingStore {
  // Assets
  assets: QuotexAsset[];
  assetStates: Record<string, AssetState>;
  selectedAssetId: string;
  
  // UI State
  timezoneOffset: number;
  isRunning: boolean;
  lastGlobalUpdate: Date;
  
  // Scanner
  scannerAssetId: string;
  scannerTime: string;
  scannerTimezone: number;
  
  // Actions
  selectAsset: (id: string) => void;
  setTimezoneOffset: (offset: number) => void;
  setScannerAsset: (id: string) => void;
  setScannerTime: (time: string) => void;
  setScannerTimezone: (offset: number) => void;
  initializeAssets: () => void;
  tick: () => void;
  fullRefresh: () => void;
}

const INITIAL_ASSET = 'EURUSD_otc';
const CANDLE_COUNT = 100;

export const useTradingStore = create<TradingStore>((set, get) => ({
  assets: QUOTEX_ASSETS,
  assetStates: {},
  selectedAssetId: INITIAL_ASSET,
  timezoneOffset: 0,
  isRunning: false,
  lastGlobalUpdate: new Date(),
  scannerAssetId: INITIAL_ASSET,
  scannerTime: '',
  scannerTimezone: 0,

  selectAsset: (id) => set({ selectedAssetId: id }),
  setTimezoneOffset: (offset) => set({ timezoneOffset: offset }),
  setScannerAsset: (id) => set({ scannerAssetId: id }),
  setScannerTime: (time) => set({ scannerTime: time }),
  setScannerTimezone: (offset) => set({ scannerTimezone: offset }),

  initializeAssets: () => {
    const assetStates: Record<string, AssetState> = {};
    
    for (const asset of QUOTEX_ASSETS) {
      const candles = generateHistoricalCandles(asset, CANDLE_COUNT);
      const lastPrice = candles[candles.length - 1].close;
      const analysis = analyzeAsset(asset.id, candles, lastPrice);
      
      assetStates[asset.id] = {
        candles,
        analysis,
        lastPrice,
        priceHistory: candles.slice(-20).map(c => c.close),
      };
    }
    
    set({ assetStates, isRunning: true });
  },

  tick: () => {
    const { assetStates, selectedAssetId } = get();
    const now = Date.now();
    const newStates = { ...assetStates };
    
    // Update ALL assets but with different frequencies for performance
    for (const asset of QUOTEX_ASSETS) {
      const state = newStates[asset.id];
      if (!state) continue;
      
      const lastCandle = state.candles[state.candles.length - 1];
      const lastCandleEndTime = (lastCandle.time + 5 * 60) * 1000;
      
      let newCandles: Candle[];
      
      if (now >= lastCandleEndTime) {
        // New candle
        const newCandle = generateNewCandle(lastCandle, asset);
        newCandles = [...state.candles.slice(-CANDLE_COUNT + 1), newCandle];
      } else {
        // Update current candle
        const updatedLast = updateCandle(lastCandle, asset);
        newCandles = [...state.candles.slice(0, -1), updatedLast];
      }
      
      const lastPrice = newCandles[newCandles.length - 1].close;
      const priceHistory = [...state.priceHistory.slice(-19), lastPrice];
      
      // Only re-run full analysis for selected asset on every tick
      // For other assets, recalculate every 30 seconds (less frequently)
      let analysis = state.analysis;
      if (asset.id === selectedAssetId || !analysis || Math.random() < 0.02) {
        analysis = analyzeAsset(asset.id, newCandles, lastPrice);
      } else {
        // Lightweight update: just update price info
        if (analysis) {
          const priceChange = lastPrice - (analysis.currentPrice || lastPrice);
          const priceChangePercent = analysis.currentPrice ? (priceChange / analysis.currentPrice) * 100 : 0;
          analysis = {
            ...analysis,
            currentPrice: lastPrice,
            priceChange,
            priceChangePercent,
            lastUpdated: new Date(),
          };
        }
      }
      
      newStates[asset.id] = {
        candles: newCandles,
        analysis,
        lastPrice,
        priceHistory,
      };
    }
    
    set({ assetStates: newStates, lastGlobalUpdate: new Date() });
  },

  fullRefresh: () => {
    const { assetStates } = get();
    const newStates = { ...assetStates };
    
    for (const asset of QUOTEX_ASSETS) {
      const state = newStates[asset.id];
      if (!state) continue;
      const analysis = analyzeAsset(asset.id, state.candles, state.lastPrice);
      newStates[asset.id] = { ...state, analysis };
    }
    
    set({ assetStates: newStates });
  },
}));

// Sorted assets by probability
export function getSortedAssets(
  assets: QuotexAsset[],
  assetStates: Record<string, AssetState>
): Array<QuotexAsset & { probability: number; direction: string }> {
  return assets
    .map(a => ({
      ...a,
      probability: assetStates[a.id]?.analysis?.probability || 50,
      direction: assetStates[a.id]?.analysis?.direction || 'COMPRA',
    }))
    .sort((a, b) => b.probability - a.probability);
}
