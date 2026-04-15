import { Candle } from './marketSimulator';
import {
  calculateRSI,
  calculateMACD,
  calculateATR,
  getLastEMA,
  analyzeMarketStructure,
  calculateFibonacci,
  analyzeVolume,
  MACDResult,
  FibonacciLevels,
  MarketStructure,
  VolumeAnalysis,
} from './indicators';

export type Direction = 'COMPRA' | 'VENTA';
export type Quality = 'A' | 'B' | 'C';
export type Risk = 'BAJO' | 'MEDIO' | 'ALTO';

export interface IndicatorSnapshot {
  rsi: number;
  rsiSignal: 'oversold' | 'overbought' | 'neutral' | 'rising' | 'falling';
  macd: MACDResult;
  ema9: number;
  ema21: number;
  ema50: number;
  emaSignal: 'bullish_alignment' | 'bearish_alignment' | 'mixed';
  atr: number;
  fibonacci: FibonacciLevels;
  marketStructure: MarketStructure;
  volume: VolumeAnalysis;
}

export interface CandlePrediction {
  candleNumber: 1 | 2 | 3;
  timeStart: Date;
  timeEnd: Date;
  direction: Direction;
  probability: number;
  quality: Quality;
  risk: Risk;
  confidence: number;
  factors: string[];
}

export interface AssetAnalysis {
  assetId: string;
  direction: Direction;
  probability: number;
  quality: Quality;
  risk: Risk;
  indicators: IndicatorSnapshot;
  predictions: CandlePrediction[];
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  trend: string;
  summary: string;
  lastUpdated: Date;
}

// ============================================================
// CORE PREDICTION ENGINE
// ============================================================
export function analyzeAsset(
  assetId: string,
  candles: Candle[],
  currentPrice: number,
  offsetMinutes: number = 0
): AssetAnalysis {
  if (candles.length < 30) {
    return createDefaultAnalysis(assetId, currentPrice);
  }

  // Calculate all indicators
  const rsi = calculateRSI(candles, 14);
  const macd = calculateMACD(candles);
  const ema9 = getLastEMA(candles, 9);
  const ema21 = getLastEMA(candles, 21);
  const ema50 = getLastEMA(candles, 50);
  const atr = calculateATR(candles, 14);
  const fibonacci = calculateFibonacci(candles);
  const marketStructure = analyzeMarketStructure(candles);
  const volume = analyzeVolume(candles);

  // RSI Signal
  let rsiSignal: IndicatorSnapshot['rsiSignal'] = 'neutral';
  const prevRsi = calculateRSI(candles.slice(0, -1), 14);
  if (rsi < 30) rsiSignal = 'oversold';
  else if (rsi > 70) rsiSignal = 'overbought';
  else if (rsi > prevRsi && rsi > 45) rsiSignal = 'rising';
  else if (rsi < prevRsi && rsi < 55) rsiSignal = 'falling';

  // EMA Alignment
  let emaSignal: IndicatorSnapshot['emaSignal'] = 'mixed';
  if (ema9 > ema21 && ema21 > ema50) emaSignal = 'bullish_alignment';
  else if (ema9 < ema21 && ema21 < ema50) emaSignal = 'bearish_alignment';

  const indicators: IndicatorSnapshot = {
    rsi, rsiSignal, macd, ema9, ema21, ema50, emaSignal, atr, fibonacci, marketStructure, volume,
  };

  // ============================================================
  // CONFLUENCE SCORING SYSTEM
  // ============================================================
  let bullScore = 0;
  let bearScore = 0;
  const factors: string[] = [];

  // RSI Confluence (weight: 20)
  if (rsi < 30) { bullScore += 20; factors.push('RSI sobrevendido (señal alcista)'); }
  else if (rsi > 70) { bearScore += 20; factors.push('RSI sobrecomprado (señal bajista)'); }
  else if (rsiSignal === 'rising') { bullScore += 10; factors.push('RSI en ascenso'); }
  else if (rsiSignal === 'falling') { bearScore += 10; factors.push('RSI en descenso'); }

  // MACD Confluence (weight: 25)
  if (macd.crossover === 'bullish') { bullScore += 25; factors.push('MACD cruce alcista'); }
  else if (macd.crossover === 'bearish') { bearScore += 25; factors.push('MACD cruce bajista'); }
  else if (macd.histogram > 0) { bullScore += 12; factors.push('MACD histograma positivo'); }
  else if (macd.histogram < 0) { bearScore += 12; factors.push('MACD histograma negativo'); }

  // EMA Confluence (weight: 20)
  if (emaSignal === 'bullish_alignment') { bullScore += 20; factors.push('EMAs alineadas alcistas (9>21>50)'); }
  else if (emaSignal === 'bearish_alignment') { bearScore += 20; factors.push('EMAs alineadas bajistas (9<21<50)'); }
  
  // Price vs EMA (weight: 10)
  if (currentPrice > ema9 && currentPrice > ema21) { bullScore += 10; factors.push('Precio sobre EMA9 y EMA21'); }
  else if (currentPrice < ema9 && currentPrice < ema21) { bearScore += 10; factors.push('Precio bajo EMA9 y EMA21'); }

  // Market Structure (weight: 15)
  if (marketStructure.trend === 'bullish') { bullScore += 15; factors.push(`Estructura alcista (${marketStructure.pattern})`); }
  else if (marketStructure.trend === 'bearish') { bearScore += 15; factors.push(`Estructura bajista (${marketStructure.pattern})`); }
  if (marketStructure.lastStructureBreak === 'up') { bullScore += 8; factors.push('Ruptura de estructura alcista'); }
  else if (marketStructure.lastStructureBreak === 'down') { bearScore += 8; factors.push('Ruptura de estructura bajista'); }

  // Fibonacci Confluence (weight: 15)
  const fibLevel = fibonacci.nearestLevel;
  const priceVsFib = currentPrice - fibonacci.nearestLevelValue;
  const atrNorm = atr / currentPrice;
  
  if (['0.618', '0.786'].includes(fibLevel)) {
    if (fibonacci.direction === 'retracement_up' && priceVsFib > -atrNorm * currentPrice) {
      bullScore += 15;
      factors.push(`Soporte Fibonacci ${fibLevel} (nivel clave)`);
    } else if (fibonacci.direction === 'retracement_down' && priceVsFib < atrNorm * currentPrice) {
      bearScore += 15;
      factors.push(`Resistencia Fibonacci ${fibLevel} (nivel clave)`);
    }
  } else if (['0.382', '0.5'].includes(fibLevel)) {
    if (fibonacci.direction === 'retracement_up') { bullScore += 8; factors.push(`Nivel Fibonacci ${fibLevel}`); }
    else { bearScore += 8; factors.push(`Nivel Fibonacci ${fibLevel}`); }
  }

  // Volume Confluence (weight: 10)
  if (volume.signal === 'high_volume_up') { bullScore += 10; factors.push('Volumen alto con precio subiendo'); }
  else if (volume.signal === 'high_volume_down') { bearScore += 10; factors.push('Volumen alto con precio bajando'); }
  else if (volume.trend === 'increasing') { 
    if (marketStructure.trend === 'bullish') bullScore += 5;
    else bearScore += 5;
  }

  // Total score
  const totalScore = bullScore + bearScore;
  const direction: Direction = bullScore >= bearScore ? 'COMPRA' : 'VENTA';
  const dominantScore = Math.max(bullScore, bearScore);
  
  // Raw probability calculation
  let probability: number;
  if (totalScore === 0) {
    probability = 50 + (Math.random() - 0.5) * 10;
  } else {
    probability = 50 + (dominantScore / totalScore - 0.5) * 60;
    // Add some controlled randomness
    probability += (Math.random() - 0.5) * 8;
    probability = Math.min(96, Math.max(51, probability));
  }
  
  probability = parseFloat(probability.toFixed(1));

  // Quality determination
  let quality: Quality;
  if (probability >= 80) quality = 'A';
  else if (probability >= 65) quality = 'B';
  else quality = 'C';

  // Risk determination (based on ATR and volatility)
  const atrPercent = (atr / currentPrice) * 100;
  let risk: Risk;
  if (atrPercent > 0.5 || totalScore < 30) risk = 'ALTO';
  else if (atrPercent > 0.2 || totalScore < 60) risk = 'MEDIO';
  else risk = 'BAJO';

  // Price change
  const prevClose = candles[candles.length - 2]?.close || currentPrice;
  const priceChange = currentPrice - prevClose;
  const priceChangePercent = (priceChange / prevClose) * 100;

  // Generate predictions for 3 future candles
  const predictions = generatePredictions(
    direction, probability, quality, risk, indicators, factors, offsetMinutes
  );

  // Summary
  const trend = marketStructure.trend === 'bullish' ? 'alcista' : 
                marketStructure.trend === 'bearish' ? 'bajista' : 'lateral';
  const summary = `Mercado en tendencia ${trend}. ${factors.slice(0, 2).join('. ')}. Confluencia: ${totalScore} puntos.`;

  return {
    assetId,
    direction,
    probability,
    quality,
    risk,
    indicators,
    predictions,
    currentPrice,
    priceChange,
    priceChangePercent,
    trend: marketStructure.trend,
    summary,
    lastUpdated: new Date(),
  };
}

// ============================================================
// 3-CANDLE PREDICTION GENERATOR
// ============================================================
function generatePredictions(
  baseDirection: Direction,
  baseProbability: number,
  _baseQuality: Quality,
  baseRisk: Risk,
  indicators: IndicatorSnapshot,
  _factors: string[],
  offsetMinutes: number
): CandlePrediction[] {
  const M5 = 5 * 60 * 1000; // 5 minutes in ms
  const now = Date.now() + offsetMinutes * 60 * 1000;
  
  // Find next M5 boundary
  const nextCandle = Math.ceil(now / M5) * M5;
  
  const predictions: CandlePrediction[] = [];
  
  for (let i = 0; i < 3; i++) {
    const timeStart = new Date(nextCandle + i * M5);
    const timeEnd = new Date(nextCandle + (i + 1) * M5);
    
    // Each candle is independent - introduce variance
    const variance = (Math.random() - 0.5) * 15;
    const probDecay = i * 4; // Slight decay for further predictions
    let prob = Math.min(96, Math.max(50, baseProbability + variance - probDecay));
    prob = parseFloat(prob.toFixed(1));
    
    // Direction can flip for independent candles
    const flipChance = 0.15 * (i + 1);
    let dir = baseDirection;
    if (Math.random() < flipChance) {
      dir = baseDirection === 'COMPRA' ? 'VENTA' : 'COMPRA';
      prob = Math.min(96, Math.max(50, 100 - prob + variance));
    }
    
    // Quality
    let q: Quality;
    if (prob >= 80) q = 'A';
    else if (prob >= 65) q = 'B';
    else q = 'C';
    
    // Risk increases for further predictions
    let r: Risk = baseRisk;
    if (i === 2 && baseRisk === 'BAJO') r = 'MEDIO';
    else if (i === 2 && baseRisk === 'MEDIO') r = 'ALTO';
    
    // Candle-specific factors
    const candleFactors: string[] = [];
    if (i === 0) {
      candleFactors.push(`${indicators.rsiSignal === 'oversold' ? 'RSI sobrevendido' : indicators.rsiSignal === 'overbought' ? 'RSI sobrecomprado' : `RSI: ${indicators.rsi.toFixed(0)}`}`);
      candleFactors.push(indicators.macd.crossover !== 'neutral' ? `MACD cruce ${indicators.macd.crossover === 'bullish' ? 'alcista' : 'bajista'}` : `MACD histograma: ${indicators.macd.histogram > 0 ? '+' : ''}${indicators.macd.histogram.toFixed(5)}`);
    } else if (i === 1) {
      candleFactors.push(`Estructura: ${indicators.marketStructure.pattern}`);
      candleFactors.push(`Fib ${indicators.fibonacci.nearestLevel} zona clave`);
    } else {
      candleFactors.push(`EMA ${indicators.emaSignal === 'bullish_alignment' ? 'alcista' : indicators.emaSignal === 'bearish_alignment' ? 'bajista' : 'mixta'}`);
      candleFactors.push(`Volumen: ${indicators.volume.trend}`);
    }
    
    predictions.push({
      candleNumber: (i + 1) as 1 | 2 | 3,
      timeStart,
      timeEnd,
      direction: dir,
      probability: parseFloat(prob.toFixed(1)),
      quality: q,
      risk: r,
      confidence: parseFloat((prob * 0.95).toFixed(1)),
      factors: candleFactors,
    });
  }
  
  return predictions;
}

function createDefaultAnalysis(assetId: string, currentPrice: number): AssetAnalysis {
  const prob = 50 + Math.random() * 15;
  return {
    assetId,
    direction: Math.random() > 0.5 ? 'COMPRA' : 'VENTA',
    probability: parseFloat(prob.toFixed(1)),
    quality: 'C',
    risk: 'ALTO',
    indicators: {
      rsi: 50,
      rsiSignal: 'neutral',
      macd: { macd: 0, signal: 0, histogram: 0, crossover: 'neutral' },
      ema9: currentPrice, ema21: currentPrice, ema50: currentPrice,
      emaSignal: 'mixed',
      atr: 0,
      fibonacci: {
        swingHigh: currentPrice * 1.01, swingLow: currentPrice * 0.99,
        level_0: currentPrice * 0.99, level_236: currentPrice * 0.993,
        level_382: currentPrice * 0.996, level_5: currentPrice,
        level_618: currentPrice * 1.004, level_786: currentPrice * 1.008,
        level_1: currentPrice * 1.01, direction: 'retracement_up',
        nearestLevel: '0.5', nearestLevelValue: currentPrice,
      },
      marketStructure: {
        trend: 'sideways', pattern: 'ranging', swingHigh: currentPrice * 1.01,
        swingLow: currentPrice * 0.99, lastStructureBreak: 'none',
      },
      volume: { averageVolume: 1000, currentVolume: 1000, ratio: 1, trend: 'normal', signal: 'normal' },
    },
    predictions: [],
    currentPrice,
    priceChange: 0,
    priceChangePercent: 0,
    trend: 'sideways',
    summary: 'Cargando datos...',
    lastUpdated: new Date(),
  };
}

// ============================================================
// SCANNER - Predict for specific future time
// ============================================================
export function scannerPredict(
  assetId: string,
  candles: Candle[],
  currentPrice: number,
  targetTime: Date,
  _timezoneOffset: number
): CandlePrediction[] {
  const analysis = analyzeAsset(assetId, candles, currentPrice);
  const M5 = 5 * 60 * 1000;
  
  // Align target time to M5 boundary
  const targetMs = targetTime.getTime();
  const alignedTarget = Math.floor(targetMs / M5) * M5;
  
  const predictions: CandlePrediction[] = [];
  for (let i = 0; i < 3; i++) {
    const timeStart = new Date(alignedTarget + i * M5);
    const timeEnd = new Date(alignedTarget + (i + 1) * M5);
    
    const variance = (Math.random() - 0.5) * 12;
    const probDecay = i * 3;
    let prob = Math.min(96, Math.max(50, analysis.probability + variance - probDecay));
    prob = parseFloat(prob.toFixed(1));
    
    let dir = analysis.direction;
    if (Math.random() < 0.1 * (i + 1)) {
      dir = dir === 'COMPRA' ? 'VENTA' : 'COMPRA';
      prob = Math.min(96, Math.max(50, 100 - prob + variance));
    }
    
    let q: Quality = prob >= 80 ? 'A' : prob >= 65 ? 'B' : 'C';
    let r: Risk = analysis.risk;
    if (i >= 1) r = r === 'BAJO' ? 'MEDIO' : 'ALTO';
    
    predictions.push({
      candleNumber: (i + 1) as 1 | 2 | 3,
      timeStart,
      timeEnd,
      direction: dir,
      probability: prob,
      quality: q,
      risk: r,
      confidence: parseFloat((prob * 0.93).toFixed(1)),
      factors: [`Análisis proyectado para ${timeStart.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`],
    });
  }
  
  return predictions;
}
