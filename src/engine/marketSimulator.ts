import { QuotexAsset } from '../data/quotexAssets';

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RealtimePrice {
  price: number;
  bid: number;
  ask: number;
  timestamp: number;
}

// Seeded random number generator for deterministic but realistic data
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return (this.seed >>> 0) / 0xffffffff;
  }
  nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

// Market regime simulation
type MarketRegime = 'trending_up' | 'trending_down' | 'ranging' | 'volatile';

function getMarketRegime(assetId: string, candleIndex: number): MarketRegime {
  const hash = assetId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const regimeSeed = (hash + Math.floor(candleIndex / 20)) % 4;
  const regimes: MarketRegime[] = ['trending_up', 'trending_down', 'ranging', 'volatile'];
  return regimes[regimeSeed];
}

export function generateHistoricalCandles(asset: QuotexAsset, count: number = 100): Candle[] {
  const candles: Candle[] = [];
  const now = Math.floor(Date.now() / 1000);
  const M5 = 5 * 60; // 5 minutes in seconds
  const startTime = now - (count * M5);

  // Align to 5-minute boundary
  const alignedStart = Math.floor(startTime / M5) * M5;

  let price = asset.basePrice;
  const volatility = getVolatility(asset);
  const rng = new SeededRandom(asset.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0));

  for (let i = 0; i < count; i++) {
    const time = alignedStart + i * M5;
    const regime = getMarketRegime(asset.id, i);

    // Trend bias based on regime
    let trendBias = 0;
    if (regime === 'trending_up') trendBias = 0.0002;
    else if (regime === 'trending_down') trendBias = -0.0002;

    // Generate realistic OHLCV
    const open = price;
    const move = (rng.next() - 0.5 + trendBias) * volatility * 2;
    const close = open * (1 + move);

    const bodySize = Math.abs(close - open);
    const wickMultiplier = regime === 'volatile' ? 2.5 : 1.5;
    const highWick = open + bodySize * wickMultiplier * rng.next();
    const lowWick = open - bodySize * wickMultiplier * rng.next();

    const high = Math.max(open, close, highWick);
    const low = Math.min(open, close, lowWick);
    const volume = Math.floor(rng.nextRange(500, 5000));

    candles.push({
      time,
      open: parseFloat(open.toFixed(asset.decimals)),
      high: parseFloat(high.toFixed(asset.decimals)),
      low: parseFloat(low.toFixed(asset.decimals)),
      close: parseFloat(close.toFixed(asset.decimals)),
      volume,
    });

    price = close;
  }

  return candles;
}

function getVolatility(asset: QuotexAsset): number {
  switch (asset.category) {
    case 'crypto': return 0.008;
    case 'commodity':
      if (asset.id.includes('XAU') || asset.id.includes('XAG')) return 0.004;
      return 0.006;
    case 'stock': return 0.005;
    case 'index': return 0.003;
    case 'forex':
    default:
      if (asset.id.includes('JPY') || asset.id.includes('BRL') || asset.id.includes('MXN')) return 0.003;
      return 0.0015;
  }
}

export function updateCandle(candle: Candle, asset: QuotexAsset): Candle {
  const volatility = getVolatility(asset);
  const move = (Math.random() - 0.5) * volatility * 0.3;
  const newClose = candle.close * (1 + move);
  
  return {
    ...candle,
    high: Math.max(candle.high, newClose),
    low: Math.min(candle.low, newClose),
    close: parseFloat(newClose.toFixed(asset.decimals)),
    volume: candle.volume + Math.floor(Math.random() * 50),
  };
}

export function generateNewCandle(previousCandle: Candle, asset: QuotexAsset): Candle {
  const M5 = 5 * 60;
  const volatility = getVolatility(asset);
  const open = previousCandle.close;
  const move = (Math.random() - 0.5) * volatility * 2;
  const close = open * (1 + move);
  const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
  const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);

  return {
    time: previousCandle.time + M5,
    open: parseFloat(open.toFixed(asset.decimals)),
    high: parseFloat(high.toFixed(asset.decimals)),
    low: parseFloat(low.toFixed(asset.decimals)),
    close: parseFloat(close.toFixed(asset.decimals)),
    volume: Math.floor(Math.random() * 2000 + 500),
  };
}

export function getRealtimePrice(asset: QuotexAsset, lastPrice: number): RealtimePrice {
  const spread = lastPrice * 0.00015;
  const tick = (Math.random() - 0.5) * lastPrice * 0.0001;
  const price = lastPrice + tick;
  return {
    price: parseFloat(price.toFixed(asset.decimals)),
    bid: parseFloat((price - spread / 2).toFixed(asset.decimals)),
    ask: parseFloat((price + spread / 2).toFixed(asset.decimals)),
    timestamp: Date.now(),
  };
}
