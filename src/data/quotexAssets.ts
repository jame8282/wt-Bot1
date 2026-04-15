export interface QuotexAsset {
  id: string;
  name: string;
  category: 'forex' | 'crypto' | 'commodity' | 'stock' | 'index';
  isOTC: boolean;
  payout: number;
  decimals: number;
  basePrice: number;
}

export const QUOTEX_ASSETS: QuotexAsset[] = [
  // FOREX OTC
  { id: 'EURUSD_otc', name: 'EUR/USD (OTC)', category: 'forex', isOTC: true, payout: 80, decimals: 5, basePrice: 1.08500 },
  { id: 'GBPUSD_otc', name: 'GBP/USD (OTC)', category: 'forex', isOTC: true, payout: 82, decimals: 5, basePrice: 1.27200 },
  { id: 'USDJPY_otc', name: 'USD/JPY (OTC)', category: 'forex', isOTC: true, payout: 80, decimals: 3, basePrice: 149.500 },
  { id: 'AUDUSD_otc', name: 'AUD/USD (OTC)', category: 'forex', isOTC: true, payout: 78, decimals: 5, basePrice: 0.65800 },
  { id: 'USDCAD_otc', name: 'USD/CAD (OTC)', category: 'forex', isOTC: true, payout: 79, decimals: 5, basePrice: 1.35200 },
  { id: 'USDCHF_otc', name: 'USD/CHF (OTC)', category: 'forex', isOTC: true, payout: 78, decimals: 5, basePrice: 0.90100 },
  { id: 'NZDUSD_otc', name: 'NZD/USD (OTC)', category: 'forex', isOTC: true, payout: 76, decimals: 5, basePrice: 0.61200 },
  { id: 'EURGBP_otc', name: 'EUR/GBP (OTC)', category: 'forex', isOTC: true, payout: 75, decimals: 5, basePrice: 0.85300 },
  { id: 'EURJPY_otc', name: 'EUR/JPY (OTC)', category: 'forex', isOTC: true, payout: 80, decimals: 3, basePrice: 162.100 },
  { id: 'GBPJPY_otc', name: 'GBP/JPY (OTC)', category: 'forex', isOTC: true, payout: 82, decimals: 3, basePrice: 190.500 },
  { id: 'AUDJPY_otc', name: 'AUD/JPY (OTC)', category: 'forex', isOTC: true, payout: 78, decimals: 3, basePrice: 98.400 },
  { id: 'CADJPY_otc', name: 'CAD/JPY (OTC)', category: 'forex', isOTC: true, payout: 77, decimals: 3, basePrice: 110.600 },
  { id: 'CHFJPY_otc', name: 'CHF/JPY (OTC)', category: 'forex', isOTC: true, payout: 76, decimals: 3, basePrice: 166.000 },
  { id: 'NZDJPY_otc', name: 'NZD/JPY (OTC)', category: 'forex', isOTC: true, payout: 75, decimals: 3, basePrice: 91.500 },
  { id: 'EURCHF_otc', name: 'EUR/CHF (OTC)', category: 'forex', isOTC: true, payout: 74, decimals: 5, basePrice: 0.97700 },
  { id: 'EURAUD_otc', name: 'EUR/AUD (OTC)', category: 'forex', isOTC: true, payout: 76, decimals: 5, basePrice: 1.64900 },
  { id: 'EURCAD_otc', name: 'EUR/CAD (OTC)', category: 'forex', isOTC: true, payout: 75, decimals: 5, basePrice: 1.46700 },
  { id: 'GBPCHF_otc', name: 'GBP/CHF (OTC)', category: 'forex', isOTC: true, payout: 74, decimals: 5, basePrice: 1.14500 },
  { id: 'GBPAUD_otc', name: 'GBP/AUD (OTC)', category: 'forex', isOTC: true, payout: 76, decimals: 5, basePrice: 1.93400 },
  { id: 'GBPCAD_otc', name: 'GBP/CAD (OTC)', category: 'forex', isOTC: true, payout: 75, decimals: 5, basePrice: 1.71700 },
  { id: 'AUDCAD_otc', name: 'AUD/CAD (OTC)', category: 'forex', isOTC: true, payout: 78, decimals: 5, basePrice: 0.89000 },
  { id: 'AUDCHF_otc', name: 'AUD/CHF (OTC)', category: 'forex', isOTC: true, payout: 74, decimals: 5, basePrice: 0.59300 },
  { id: 'AUDNZD_otc', name: 'AUD/NZD (OTC)', category: 'forex', isOTC: true, payout: 73, decimals: 5, basePrice: 1.07500 },
  { id: 'CADCHF_otc', name: 'CAD/CHF (OTC)', category: 'forex', isOTC: true, payout: 72, decimals: 5, basePrice: 0.66600 },
  { id: 'NZDCAD_otc', name: 'NZD/CAD (OTC)', category: 'forex', isOTC: true, payout: 73, decimals: 5, basePrice: 0.82800 },
  { id: 'NZDCHF_otc', name: 'NZD/CHF (OTC)', category: 'forex', isOTC: true, payout: 72, decimals: 5, basePrice: 0.55000 },
  { id: 'USDBRL_otc', name: 'USD/BRL (OTC)', category: 'forex', isOTC: true, payout: 85, decimals: 4, basePrice: 5.0200 },
  { id: 'USDINR_otc', name: 'USD/INR (OTC)', category: 'forex', isOTC: true, payout: 84, decimals: 3, basePrice: 83.200 },
  { id: 'USDMXN_otc', name: 'USD/MXN (OTC)', category: 'forex', isOTC: true, payout: 83, decimals: 4, basePrice: 17.1500 },
  { id: 'USDEGP_otc', name: 'USD/EGP (OTC)', category: 'forex', isOTC: true, payout: 82, decimals: 3, basePrice: 30.900 },
  { id: 'USDARS_otc', name: 'USD/ARS (OTC)', category: 'forex', isOTC: true, payout: 86, decimals: 2, basePrice: 1010.50 },
  { id: 'USDNGN_otc', name: 'USD/NGN (OTC)', category: 'forex', isOTC: true, payout: 83, decimals: 2, basePrice: 1580.00 },
  { id: 'USDCOP_otc', name: 'USD/COP (OTC)', category: 'forex', isOTC: true, payout: 82, decimals: 1, basePrice: 4080.0 },
  // FOREX REGULAR
  { id: 'EURUSD', name: 'EUR/USD', category: 'forex', isOTC: false, payout: 76, decimals: 5, basePrice: 1.08500 },
  { id: 'GBPUSD', name: 'GBP/USD', category: 'forex', isOTC: false, payout: 78, decimals: 5, basePrice: 1.27200 },
  { id: 'USDJPY', name: 'USD/JPY', category: 'forex', isOTC: false, payout: 76, decimals: 3, basePrice: 149.500 },
  { id: 'AUDUSD', name: 'AUD/USD', category: 'forex', isOTC: false, payout: 74, decimals: 5, basePrice: 0.65800 },
  { id: 'USDCAD', name: 'USD/CAD', category: 'forex', isOTC: false, payout: 75, decimals: 5, basePrice: 1.35200 },
  { id: 'USDCHF', name: 'USD/CHF', category: 'forex', isOTC: false, payout: 74, decimals: 5, basePrice: 0.90100 },
  { id: 'NZDUSD', name: 'NZD/USD', category: 'forex', isOTC: false, payout: 72, decimals: 5, basePrice: 0.61200 },
  { id: 'EURGBP', name: 'EUR/GBP', category: 'forex', isOTC: false, payout: 71, decimals: 5, basePrice: 0.85300 },
  { id: 'EURJPY', name: 'EUR/JPY', category: 'forex', isOTC: false, payout: 76, decimals: 3, basePrice: 162.100 },
  { id: 'GBPJPY', name: 'GBP/JPY', category: 'forex', isOTC: false, payout: 78, decimals: 3, basePrice: 190.500 },
  // CRYPTO OTC
  { id: 'BTCUSD_otc', name: 'BTC/USD (OTC)', category: 'crypto', isOTC: true, payout: 80, decimals: 2, basePrice: 67500.00 },
  { id: 'ETHUSD_otc', name: 'ETH/USD (OTC)', category: 'crypto', isOTC: true, payout: 78, decimals: 2, basePrice: 3520.00 },
  { id: 'LTCUSD_otc', name: 'LTC/USD (OTC)', category: 'crypto', isOTC: true, payout: 75, decimals: 2, basePrice: 95.50 },
  { id: 'XRPUSD_otc', name: 'XRP/USD (OTC)', category: 'crypto', isOTC: true, payout: 76, decimals: 5, basePrice: 0.62500 },
  { id: 'BCHUSD_otc', name: 'BCH/USD (OTC)', category: 'crypto', isOTC: true, payout: 74, decimals: 2, basePrice: 465.00 },
  { id: 'EOSUSD_otc', name: 'EOS/USD (OTC)', category: 'crypto', isOTC: true, payout: 72, decimals: 4, basePrice: 0.8500 },
  { id: 'DOTUSD_otc', name: 'DOT/USD (OTC)', category: 'crypto', isOTC: true, payout: 73, decimals: 4, basePrice: 7.2300 },
  { id: 'SOLUSD_otc', name: 'SOL/USD (OTC)', category: 'crypto', isOTC: true, payout: 76, decimals: 2, basePrice: 178.50 },
  { id: 'BNBUSD_otc', name: 'BNB/USD (OTC)', category: 'crypto', isOTC: true, payout: 75, decimals: 2, basePrice: 590.00 },
  { id: 'ADAUSD_otc', name: 'ADA/USD (OTC)', category: 'crypto', isOTC: true, payout: 73, decimals: 5, basePrice: 0.47500 },
  // COMMODITIES OTC
  { id: 'XAUUSD_otc', name: 'Oro/USD (OTC)', category: 'commodity', isOTC: true, payout: 82, decimals: 2, basePrice: 2385.00 },
  { id: 'XAGUSD_otc', name: 'Plata/USD (OTC)', category: 'commodity', isOTC: true, payout: 79, decimals: 4, basePrice: 29.5000 },
  { id: 'XPTUSD_otc', name: 'Platino/USD (OTC)', category: 'commodity', isOTC: true, payout: 78, decimals: 2, basePrice: 980.00 },
  { id: 'USOIL_otc', name: 'Petróleo US (OTC)', category: 'commodity', isOTC: true, payout: 80, decimals: 3, basePrice: 79.500 },
  { id: 'UKOIL_otc', name: 'Petróleo UK (OTC)', category: 'commodity', isOTC: true, payout: 79, decimals: 3, basePrice: 84.200 },
  { id: 'NATGAS_otc', name: 'Gas Natural (OTC)', category: 'commodity', isOTC: true, payout: 77, decimals: 4, basePrice: 2.8500 },
  // COMMODITIES REGULAR
  { id: 'XAUUSD', name: 'Oro/USD', category: 'commodity', isOTC: false, payout: 78, decimals: 2, basePrice: 2385.00 },
  { id: 'XAGUSD', name: 'Plata/USD', category: 'commodity', isOTC: false, payout: 75, decimals: 4, basePrice: 29.5000 },
  { id: 'USOIL', name: 'Petróleo US', category: 'commodity', isOTC: false, payout: 76, decimals: 3, basePrice: 79.500 },
  // STOCKS OTC
  { id: 'APPLE_otc', name: 'Apple Inc. (OTC)', category: 'stock', isOTC: true, payout: 76, decimals: 2, basePrice: 189.50 },
  { id: 'AMAZON_otc', name: 'Amazon (OTC)', category: 'stock', isOTC: true, payout: 75, decimals: 2, basePrice: 178.30 },
  { id: 'GOOGLE_otc', name: 'Alphabet (OTC)', category: 'stock', isOTC: true, payout: 74, decimals: 2, basePrice: 174.20 },
  { id: 'MICROSOFT_otc', name: 'Microsoft (OTC)', category: 'stock', isOTC: true, payout: 75, decimals: 2, basePrice: 415.00 },
  { id: 'TESLA_otc', name: 'Tesla (OTC)', category: 'stock', isOTC: true, payout: 78, decimals: 2, basePrice: 245.00 },
  { id: 'META_otc', name: 'Meta (OTC)', category: 'stock', isOTC: true, payout: 76, decimals: 2, basePrice: 520.00 },
  { id: 'NETFLIX_otc', name: 'Netflix (OTC)', category: 'stock', isOTC: true, payout: 74, decimals: 2, basePrice: 680.00 },
  { id: 'NVIDIA_otc', name: 'NVIDIA (OTC)', category: 'stock', isOTC: true, payout: 77, decimals: 2, basePrice: 875.00 },
  { id: 'TWITTER_otc', name: 'Twitter/X (OTC)', category: 'stock', isOTC: true, payout: 73, decimals: 2, basePrice: 54.20 },
  { id: 'ALIBABA_otc', name: 'Alibaba (OTC)', category: 'stock', isOTC: true, payout: 75, decimals: 2, basePrice: 78.50 },
  // INDICES OTC
  { id: 'US500_otc', name: 'S&P 500 (OTC)', category: 'index', isOTC: true, payout: 79, decimals: 2, basePrice: 5200.00 },
  { id: 'US100_otc', name: 'Nasdaq 100 (OTC)', category: 'index', isOTC: true, payout: 80, decimals: 2, basePrice: 18200.00 },
  { id: 'US30_otc', name: 'Dow Jones 30 (OTC)', category: 'index', isOTC: true, payout: 78, decimals: 2, basePrice: 38900.00 },
  { id: 'UK100_otc', name: 'FTSE 100 (OTC)', category: 'index', isOTC: true, payout: 77, decimals: 2, basePrice: 8100.00 },
  { id: 'DE40_otc', name: 'DAX 40 (OTC)', category: 'index', isOTC: true, payout: 78, decimals: 2, basePrice: 18500.00 },
  { id: 'FR40_otc', name: 'CAC 40 (OTC)', category: 'index', isOTC: true, payout: 76, decimals: 2, basePrice: 8050.00 },
  { id: 'JP225_otc', name: 'Nikkei 225 (OTC)', category: 'index', isOTC: true, payout: 77, decimals: 2, basePrice: 38200.00 },
  { id: 'AU200_otc', name: 'ASX 200 (OTC)', category: 'index', isOTC: true, payout: 75, decimals: 2, basePrice: 7850.00 },
  { id: 'STOXX50_otc', name: 'Euro Stoxx 50 (OTC)', category: 'index', isOTC: true, payout: 76, decimals: 2, basePrice: 5020.00 },
  { id: 'HK33_otc', name: 'Hang Seng (OTC)', category: 'index', isOTC: true, payout: 77, decimals: 2, basePrice: 17800.00 },
];

export const CATEGORY_LABELS: Record<string, string> = {
  forex: 'Forex',
  crypto: 'Criptomonedas',
  commodity: 'Materias Primas',
  stock: 'Acciones',
  index: 'Índices',
};
