import { Candle } from './marketSimulator';

// ============================================================
// RSI - Relative Strength Index
// ============================================================
export function calculateRSI(candles: Candle[], period: number = 14): number {
  if (candles.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = candles.length - period; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change >= 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// ============================================================
// EMA - Exponential Moving Average
// ============================================================
export function calculateEMA(candles: Candle[], period: number): number[] {
  if (candles.length < period) return [];
  
  const closes = candles.map(c => c.close);
  const k = 2 / (period + 1);
  const ema: number[] = [];
  
  // Seed with SMA
  let sum = 0;
  for (let i = 0; i < period; i++) sum += closes[i];
  ema[period - 1] = sum / period;
  
  for (let i = period; i < closes.length; i++) {
    ema[i] = closes[i] * k + ema[i - 1] * (1 - k);
  }
  
  return ema;
}

export function getLastEMA(candles: Candle[], period: number): number {
  const emas = calculateEMA(candles, period);
  return emas[emas.length - 1] || candles[candles.length - 1]?.close || 0;
}

// ============================================================
// MACD - Moving Average Convergence Divergence
// ============================================================
export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
  crossover: 'bullish' | 'bearish' | 'neutral';
}

export function calculateMACD(candles: Candle[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): MACDResult {
  if (candles.length < slowPeriod + signalPeriod) {
    return { macd: 0, signal: 0, histogram: 0, crossover: 'neutral' };
  }
  
  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);
  
  // Calculate MACD line values
  const macdLine: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (fastEMA[i] !== undefined && slowEMA[i] !== undefined) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }
  
  // Signal line = EMA of MACD line
  const signalLine: number[] = [];
  if (macdLine.length >= signalPeriod) {
    const k = 2 / (signalPeriod + 1);
    let sum = 0;
    for (let i = 0; i < signalPeriod; i++) sum += macdLine[i];
    signalLine[signalPeriod - 1] = sum / signalPeriod;
    
    for (let i = signalPeriod; i < macdLine.length; i++) {
      signalLine[i] = macdLine[i] * k + signalLine[i - 1] * (1 - k);
    }
  }
  
  const lastMACD = macdLine[macdLine.length - 1] || 0;
  const lastSignal = signalLine[signalLine.length - 1] || 0;
  const prevMACD = macdLine[macdLine.length - 2] || 0;
  const prevSignal = signalLine[signalLine.length - 2] || 0;
  
  let crossover: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (prevMACD <= prevSignal && lastMACD > lastSignal) crossover = 'bullish';
  else if (prevMACD >= prevSignal && lastMACD < lastSignal) crossover = 'bearish';
  
  return {
    macd: lastMACD,
    signal: lastSignal,
    histogram: lastMACD - lastSignal,
    crossover,
  };
}

// ============================================================
// ATR - Average True Range
// ============================================================
export function calculateATR(candles: Candle[], period: number = 14): number {
  if (candles.length < 2) return 0;
  
  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    trueRanges.push(Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    ));
  }
  
  const startIdx = Math.max(0, trueRanges.length - period);
  const slice = trueRanges.slice(startIdx);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

// ============================================================
// Market Structure - Higher Highs, Lower Lows, etc.
// ============================================================
export interface MarketStructure {
  trend: 'bullish' | 'bearish' | 'sideways';
  pattern: 'HH-HL' | 'LL-LH' | 'ranging' | 'mixed';
  swingHigh: number;
  swingLow: number;
  lastStructureBreak: 'up' | 'down' | 'none';
}

export function analyzeMarketStructure(candles: Candle[]): MarketStructure {
  if (candles.length < 10) {
    const last = candles[candles.length - 1];
    return {
      trend: 'sideways',
      pattern: 'ranging',
      swingHigh: last?.high || 0,
      swingLow: last?.low || 0,
      lastStructureBreak: 'none',
    };
  }
  
  // Find pivot highs and lows (looking back 5 candles)
  const pivotHighs: number[] = [];
  const pivotLows: number[] = [];
  
  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i];
    const isHigh = c.high > candles[i-1].high && c.high > candles[i-2].high &&
                   c.high > candles[i+1].high && c.high > candles[i+2].high;
    const isLow  = c.low < candles[i-1].low && c.low < candles[i-2].low &&
                   c.low < candles[i+1].low && c.low < candles[i+2].low;
    
    if (isHigh) pivotHighs.push(c.high);
    if (isLow) pivotLows.push(c.low);
  }
  
  const recentHighs = pivotHighs.slice(-3);
  const recentLows = pivotLows.slice(-3);
  
  const swingHigh = Math.max(...recentHighs.length ? recentHighs : [candles[candles.length - 1].high]);
  const swingLow = Math.min(...recentLows.length ? recentLows : [candles[candles.length - 1].low]);
  
  // Determine trend
  let higherHighs = 0;
  let lowerLows = 0;
  for (let i = 1; i < recentHighs.length; i++) {
    if (recentHighs[i] > recentHighs[i-1]) higherHighs++;
    else lowerLows++;
  }
  for (let i = 1; i < recentLows.length; i++) {
    if (recentLows[i] < recentLows[i-1]) lowerLows++;
  }
  
  let trend: 'bullish' | 'bearish' | 'sideways' = 'sideways';
  let pattern: 'HH-HL' | 'LL-LH' | 'ranging' | 'mixed' = 'ranging';
  
  const lastCandles = candles.slice(-10);
  const firstClose = lastCandles[0].close;
  const lastClose = lastCandles[lastCandles.length - 1].close;
  const priceChange = (lastClose - firstClose) / firstClose;
  
  if (priceChange > 0.003) { trend = 'bullish'; pattern = 'HH-HL'; }
  else if (priceChange < -0.003) { trend = 'bearish'; pattern = 'LL-LH'; }
  else { trend = 'sideways'; pattern = 'ranging'; }
  
  // Check for structure break
  const last = candles[candles.length - 1];
  let lastStructureBreak: 'up' | 'down' | 'none' = 'none';
  if (last.close > swingHigh * 0.999) lastStructureBreak = 'up';
  else if (last.close < swingLow * 1.001) lastStructureBreak = 'down';
  
  return { trend, pattern, swingHigh, swingLow, lastStructureBreak };
}

// ============================================================
// Fibonacci Levels
// ============================================================
export interface FibonacciLevels {
  swingHigh: number;
  swingLow: number;
  level_0: number;
  level_236: number;
  level_382: number;
  level_5: number;
  level_618: number;
  level_786: number;
  level_1: number;
  direction: 'retracement_up' | 'retracement_down';
  nearestLevel: string;
  nearestLevelValue: number;
}

export function calculateFibonacci(candles: Candle[]): FibonacciLevels {
  if (candles.length < 20) {
    const p = candles[candles.length - 1]?.close || 1;
    return {
      swingHigh: p * 1.01,
      swingLow: p * 0.99,
      level_0: p * 0.99,
      level_236: p * 0.9924,
      level_382: p * 0.9962,
      level_5: p,
      level_618: p * 1.0038,
      level_786: p * 1.0076,
      level_1: p * 1.01,
      direction: 'retracement_up',
      nearestLevel: '0.5',
      nearestLevelValue: p,
    };
  }
  
  // Find swing high and low in recent candles
  const lookback = Math.min(50, candles.length);
  const recent = candles.slice(-lookback);
  
  let swingHigh = recent[0].high;
  let swingLow = recent[0].low;
  let highIdx = 0;
  let lowIdx = 0;
  
  for (let i = 0; i < recent.length; i++) {
    if (recent[i].high > swingHigh) { swingHigh = recent[i].high; highIdx = i; }
    if (recent[i].low < swingLow) { swingLow = recent[i].low; lowIdx = i; }
  }
  
  const direction = highIdx > lowIdx ? 'retracement_up' : 'retracement_down';
  const range = swingHigh - swingLow;
  const currentPrice = candles[candles.length - 1].close;
  
  const levels = {
    level_0: direction === 'retracement_up' ? swingLow : swingHigh,
    level_236: direction === 'retracement_up' ? swingHigh - range * 0.236 : swingLow + range * 0.236,
    level_382: direction === 'retracement_up' ? swingHigh - range * 0.382 : swingLow + range * 0.382,
    level_5: direction === 'retracement_up' ? swingHigh - range * 0.5 : swingLow + range * 0.5,
    level_618: direction === 'retracement_up' ? swingHigh - range * 0.618 : swingLow + range * 0.618,
    level_786: direction === 'retracement_up' ? swingHigh - range * 0.786 : swingLow + range * 0.786,
    level_1: direction === 'retracement_up' ? swingHigh : swingLow,
  };
  
  // Find nearest level to current price
  const levelEntries = Object.entries(levels);
  let nearestLevel = levelEntries[0][0];
  let nearestLevelValue = levelEntries[0][1];
  let minDist = Math.abs(currentPrice - nearestLevelValue);
  
  for (const [key, val] of levelEntries) {
    const dist = Math.abs(currentPrice - val);
    if (dist < minDist) {
      minDist = dist;
      nearestLevel = key;
      nearestLevelValue = val;
    }
  }
  
  const levelNames: Record<string, string> = {
    level_0: '0.0',
    level_236: '0.236',
    level_382: '0.382',
    level_5: '0.5',
    level_618: '0.618',
    level_786: '0.786',
    level_1: '1.0',
  };
  
  return {
    swingHigh,
    swingLow,
    ...levels,
    direction,
    nearestLevel: levelNames[nearestLevel] || nearestLevel,
    nearestLevelValue,
  };
}

// ============================================================
// Volume Analysis
// ============================================================
export interface VolumeAnalysis {
  averageVolume: number;
  currentVolume: number;
  ratio: number;
  trend: 'increasing' | 'decreasing' | 'normal';
  signal: 'high_volume_up' | 'high_volume_down' | 'low_volume' | 'normal';
}

export function analyzeVolume(candles: Candle[]): VolumeAnalysis {
  if (candles.length < 10) {
    return { averageVolume: 1000, currentVolume: 1000, ratio: 1, trend: 'normal', signal: 'normal' };
  }
  
  const volumes = candles.slice(-20).map(c => c.volume);
  const averageVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const currentVolume = candles[candles.length - 1].volume;
  const ratio = currentVolume / averageVolume;
  
  const lastClose = candles[candles.length - 1].close;
  const prevClose = candles[candles.length - 2]?.close || lastClose;
  const priceUp = lastClose > prevClose;
  
  let trend: 'increasing' | 'decreasing' | 'normal' = 'normal';
  const recentVols = volumes.slice(-5);
  const volChange = recentVols[recentVols.length - 1] / recentVols[0];
  if (volChange > 1.2) trend = 'increasing';
  else if (volChange < 0.8) trend = 'decreasing';
  
  let signal: 'high_volume_up' | 'high_volume_down' | 'low_volume' | 'normal' = 'normal';
  if (ratio > 1.5 && priceUp) signal = 'high_volume_up';
  else if (ratio > 1.5 && !priceUp) signal = 'high_volume_down';
  else if (ratio < 0.5) signal = 'low_volume';
  
  return { averageVolume, currentVolume, ratio, trend, signal };
}
