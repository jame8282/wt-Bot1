import React, { useEffect, useRef, memo } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickSeries, LineSeries, ColorType, CrosshairMode, UTCTimestamp } from 'lightweight-charts';
import { Candle } from '../engine/marketSimulator';
import { FibonacciLevels } from '../engine/indicators';

interface CandleChartProps {
  candles: Candle[];
  ema9: number[];
  ema21: number[];
  ema50: number[];
  fibonacci: FibonacciLevels;
}

const CandleChart: React.FC<CandleChartProps> = memo(({ candles, ema9, ema21, ema50, fibonacci }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const ema9SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema21SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0e1a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e2a3a' },
        horzLines: { color: '#1e2a3a' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#3b82f6', labelBackgroundColor: '#1d4ed8' },
        horzLine: { color: '#3b82f6', labelBackgroundColor: '#1d4ed8' },
      },
      rightPriceScale: {
        borderColor: '#1e2a3a',
      },
      timeScale: {
        borderColor: '#1e2a3a',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    candleSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    ema9SeriesRef.current = chartRef.current.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 1,
      title: 'EMA9',
      priceLineVisible: false,
      lastValueVisible: false,
    });

    ema21SeriesRef.current = chartRef.current.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 1,
      title: 'EMA21',
      priceLineVisible: false,
      lastValueVisible: false,
    });

    ema50SeriesRef.current = chartRef.current.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 1,
      title: 'EMA50',
      priceLineVisible: false,
      lastValueVisible: false,
    });

    return () => {
      chartRef.current?.remove();
      chartRef.current = null;
    };
  }, []);

  // Update data
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || candles.length === 0) return;

    const chartData = candles.map(c => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candleSeriesRef.current.setData(chartData);

    // EMA lines
    if (ema9SeriesRef.current && ema9.length > 0) {
      const ema9Data = ema9
        .map((val, i) => ({ time: candles[i]?.time as UTCTimestamp, value: val }))
        .filter(d => d.time && d.value !== undefined);
      if (ema9Data.length > 0) ema9SeriesRef.current.setData(ema9Data);
    }

    if (ema21SeriesRef.current && ema21.length > 0) {
      const ema21Data = ema21
        .map((val, i) => ({ time: candles[i]?.time as UTCTimestamp, value: val }))
        .filter(d => d.time && d.value !== undefined);
      if (ema21Data.length > 0) ema21SeriesRef.current.setData(ema21Data);
    }

    if (ema50SeriesRef.current && ema50.length > 0) {
      const ema50Data = ema50
        .map((val, i) => ({ time: candles[i]?.time as UTCTimestamp, value: val }))
        .filter(d => d.time && d.value !== undefined);
      if (ema50Data.length > 0) ema50SeriesRef.current.setData(ema50Data);
    }

    // Fibonacci price lines
    const fibColors: Record<string, string> = {
      level_0: '#94a3b8',
      level_236: '#fbbf24',
      level_382: '#fb923c',
      level_5: '#f87171',
      level_618: '#34d399',
      level_786: '#60a5fa',
      level_1: '#94a3b8',
    };
    const fibLabels: Record<string, string> = {
      level_0: 'Fib 0.0',
      level_236: 'Fib 0.236',
      level_382: 'Fib 0.382',
      level_5: 'Fib 0.5',
      level_618: 'Fib 0.618',
      level_786: 'Fib 0.786',
      level_1: 'Fib 1.0',
    };

    Object.entries(fibonacci).forEach(([key, value]) => {
      if (key in fibColors && typeof value === 'number' && candleSeriesRef.current) {
        candleSeriesRef.current.createPriceLine({
          price: value,
          color: fibColors[key],
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: fibLabels[key] || key,
        });
      }
    });

    chartRef.current.timeScale().fitContent();
  }, [candles, ema9, ema21, ema50, fibonacci]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current || !chartRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        chartRef.current?.resize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
});

CandleChart.displayName = 'CandleChart';

export default CandleChart;
