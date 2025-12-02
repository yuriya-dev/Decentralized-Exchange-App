import { Request, Response } from 'express';
import axios from 'axios';

// Cache sederhana untuk Token List & Prices
let tokenCache: any[] = [];
let priceCache: Record<string, number> = {};
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // Cache 5 menit

// Fallback jika API CoinGecko Down/Rate Limit
const FALLBACK_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', id: 'ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', price: 2250, changeVal: 1.2, marketCap: 250000000000 },
  { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', price: 42000, changeVal: -0.5, marketCap: 800000000000 },
  { symbol: 'USDC', name: 'USD Coin', id: 'usd-coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', price: 1, changeVal: 0.01, marketCap: 25000000000 },
];

// --- KONFIGURASI API COINGECKO ---
// Pastikan file .env backend berisi: COINGECKO_API_KEY=CG-xxxxxxx
const API_KEY = process.env.COINGECKO_API_KEY;

// Base URL: Gunakan 'api.coingecko.com' untuk Free/Demo, 'pro-api.coingecko.com' untuk Pro
const BASE_URL = 'https://api.coingecko.com/api/v3'; 

const AXIOS_CONFIG = {
  headers: API_KEY ? { 'x-cg-demo-api-key': API_KEY } : {}, // Header khusus Demo Key
  timeout: 10000
};

export const getTokens = async (req: Request, res: Response) => {
  const now = Date.now();

  // Gunakan cache jika masih valid
  if (tokenCache.length > 0 && (now - lastFetchTime < CACHE_DURATION)) {
    return res.json(tokenCache);
  }

  try {
    // Fetch Top 100 Coins Markets
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      ...AXIOS_CONFIG, 
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false
      }
    });

    if (response.data) {
      // Format data untuk frontend - UPDATE: Tambah changeVal & marketCap
      const formattedTokens = response.data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        id: coin.id,
        logo: coin.image,
        price: coin.current_price,
        changeVal: coin.price_change_percentage_24h, // Tambahan Data
        marketCap: coin.market_cap // Tambahan Data
      }));

      // Update Cache
      tokenCache = formattedTokens;
      
      // Update Price Cache sekalian
      formattedTokens.forEach((t: any) => {
        priceCache[t.symbol] = t.price;
      });
      lastFetchTime = now;

      return res.json(formattedTokens);
    }
  } catch (error: any) {
    console.error("Failed to fetch tokens from CoinGecko (Using Fallback):", error.message);
  }

  // Return fallback jika error/rate limit
  res.json(FALLBACK_TOKENS);
};

export const getPrices = (req: Request, res: Response) => {
  // Return cache harga yang didapat dari getTokens
  if (Object.keys(priceCache).length === 0) {
     FALLBACK_TOKENS.forEach(t => priceCache[t.symbol] = t.price);
  }
  res.json(priceCache);
};

export const getChartData = async (req: Request, res: Response) => {
  const { symbol = 'ETH', range = '1D' } = req.query;
  
  // Cari ID Coin berdasarkan Symbol dari cache token kita
  // UPDATE: Logic pencarian yang lebih aman
  const upperSymbol = (symbol as string).toUpperCase();
  const token = tokenCache.find((t: any) => t.symbol === upperSymbol);
  
  // Jika tidak ketemu di cache token, gunakan mapping manual atau default bitcoin
  let coinId = token ? token.id : null;
  
  if (!coinId) {
      const idMap: Record<string, string> = { 'ETH': 'ethereum', 'BTC': 'bitcoin', 'SOL': 'solana' };
      coinId = idMap[upperSymbol] || 'bitcoin';
  }

  let days = '1';
  if (range === '1W') days = '7';
  if (range === '1M') days = '30';
  if (range === '1Y') days = '365';

  try {
    const response = await axios.get(`${BASE_URL}/coins/${coinId}/market_chart`, {
      ...AXIOS_CONFIG, 
      params: { vs_currency: 'usd', days: days }
    });

    if (response.data && response.data.prices) {
      const rawData = response.data.prices;
      // Downsample data agar tidak terlalu berat (ambil max 50 point)
      const step = Math.ceil(rawData.length / 50);
      const formattedData = rawData
        .filter((_: any, index: number) => index % step === 0)
        .map((item: [number, number]) => ({
            name: range === '1D' 
                ? new Date(item[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                : new Date(item[0]).toLocaleDateString([], {month: 'short', day: 'numeric'}),
            price: item[1]
        }));
      
      return res.json(formattedData);
    }
  } catch (error: any) {
    console.error(`Chart Error for ${symbol}: ${error.message}`);
  }

  res.json([]);
};

export const simulateSwap = (req: Request, res: Response) => {
  const { fromToken, toToken, amount } = req.body;
  
  // Gunakan harga dari cache
  const fromPrice = priceCache[fromToken as string] || 0;
  const toPrice = priceCache[toToken as string] || 0;
  
  if (!fromPrice || !toPrice || !amount) {
      return res.json({ input: amount, output: 0, fee: 0, rate: 0, priceImpact: 0 });
  }

  const rate = fromPrice / toPrice;
  const rawOutput = amount * rate;
  const fee = rawOutput * 0.003; 
  const priceImpact = Math.min((amount * fromPrice) / 500000, 0.1); // Simulasi liquidity
  
  const outputFinal = (rawOutput - fee) * (1 - priceImpact);

  res.json({
    input: amount,
    output: outputFinal,
    fee: fee,
    rate: rate,
    priceImpact: priceImpact * 100
  });
};