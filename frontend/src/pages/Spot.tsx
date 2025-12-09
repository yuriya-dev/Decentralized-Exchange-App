import React, { useState, useEffect } from 'react';
import { 
  Search, Star, Zap, LayoutGrid, List, 
  ArrowUpRight, ArrowDownRight, Loader2, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// --- Interface Data ---
interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  // Fields simulasi untuk data yang tidak tersedia di public API
  netFlow: string;
  netFlowPositive: boolean;
  liquidity: string;
  holders: string;
  holderChange: number;
  likes: number;
  smart: number;
}

// --- Sub Components ---

const FilterTab = ({ 
  label, 
  active = false, 
  onClick 
}: { 
  label: string, 
  active?: boolean, 
  onClick: () => void 
}) => (
  <button 
    onClick={onClick}
    className={`
      px-4 py-2 text-sm font-semibold transition-all rounded-lg whitespace-nowrap
      ${active 
        ? 'bg-light-primary/10 dark:bg-fintech-primary/10 text-light-primary dark:text-fintech-primary' 
        : 'text-light-muted dark:text-fintech-muted hover:text-light-text dark:hover:text-white hover:bg-light-bg dark:hover:bg-white/5'}
    `}
  >
    {label}
  </button>
);

const TimeFrameBtn = ({
  label,
  active = false,
  onClick
}: {
  label: string,
  active?: boolean,
  onClick: () => void
}) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors
      ${active
        ? 'text-light-primary dark:text-fintech-primary bg-light-bg dark:bg-fintech-bg font-bold shadow-sm border border-light-border dark:border-fintech-border/50'
        : 'text-light-muted dark:text-fintech-muted hover:text-light-text dark:hover:text-white'}
    `}
  >
    {label}
  </button>
);

const Spot = () => {
  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fitur Baru: Pagination, Kategori, TimeFrame
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all'); // 'all', 'defi', 'layer-1', etc.
  const [timeFrame, setTimeFrame] = useState<'1h' | '24h' | '7d'>('24h');

  // Mapping Kategori UI ke Parameter API CoinGecko
  const categories: { label: string; value: string }[] = [
    { label: "All Assets", value: "all" },
    { label: "Top Gainers", value: "gainers" }, // Custom logic sorting
    { label: "DeFi", value: "decentralized_finance_defi" },
    { label: "Layer 1", value: "layer-1" },
    { label: "Metaverse", value: "metaverse" },
    { label: "Gaming", value: "gaming" }, // Ganti New Listings (susah di API free) dengan Gaming
  ];

  // --- Fetch Data dari CoinGecko ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Base URL
        let url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=20&page=${page}&sparkline=false&price_change_percentage=1h,24h,7d`;
        
        // Handle Category Param
        if (category !== 'all' && category !== 'gainers') {
          url += `&category=${category}`;
        }

        // Handle Sorting untuk "Top Gainers" (API Free tidak support sort by change, jadi kita default market_cap dan sort di client nanti jika gainers)
        // Default sort: market_cap_desc
        url += `&order=market_cap_desc`;

        const response = await fetch(url);

        if (!response.ok) {
          if (response.status === 429) throw new Error('Too Many Requests (Rate Limit). Tunggu sebentar.');
          throw new Error('Gagal mengambil data.');
        }

        const data = await response.json();

        // Transformasi data
        let formattedData: CoinData[] = data.map((coin: any) => {
          const isPositiveFlow = Math.random() > 0.4;
          return {
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            image: coin.image,
            current_price: coin.current_price,
            market_cap: coin.market_cap,
            fully_diluted_valuation: coin.fully_diluted_valuation || coin.market_cap * 1.2,
            total_volume: coin.total_volume,
            price_change_percentage_24h: coin.price_change_percentage_24h || 0,
            price_change_percentage_1h_in_currency: coin.price_change_percentage_1h_in_currency || 0,
            price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency || 0,
            
            // Mock Data Generator
            netFlow: (Math.random() * 500 + 50).toFixed(0) + 'K',
            netFlowPositive: isPositiveFlow,
            liquidity: (Math.random() * 50 + 5).toFixed(1) + 'M',
            holders: (Math.random() * 100 + 10).toFixed(1) + 'K',
            holderChange: Number(((Math.random() - 0.4) * 2).toFixed(2)),
            likes: Math.floor(Math.random() * 200),
            smart: Math.floor(Math.random() * 50),
          };
        });

        // Client-side sort untuk 'Top Gainers' karena API limitasi
        if (category === 'gainers') {
          formattedData.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        }

        setAssets(formattedData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, category]); // Re-fetch saat page atau category berubah

  // --- Helper Format Angka ---
  const formatCurrency = (val: number) => {
    if (!val) return '-';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  // Helper untuk mendapatkan persentase perubahan sesuai TimeFrame aktif
  const getActivePriceChange = (coin: CoinData) => {
    switch (timeFrame) {
      case '1h': return coin.price_change_percentage_1h_in_currency;
      case '7d': return coin.price_change_percentage_7d_in_currency;
      case '24h': default: return coin.price_change_percentage_24h;
    }
  };

  const getActivePriceChangeLabel = () => {
    switch (timeFrame) {
      case '1h': return '1H Change';
      case '7d': return '7D Change';
      case '24h': default: return '24H Change';
    }
  };

  const filteredAssets = assets.filter(
    coin => 
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-10 animate-fade-in px-4 lg:px-0 mt-6">
      
      {/* Page Title & Search */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Spot Market</h1>
          <p className="text-sm text-light-muted dark:text-fintech-muted mt-1">
            Discover and trade the hottest tokens (Page {page})
          </p>
        </div>

        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-fintech-muted group-focus-within:text-light-primary dark:group-focus-within:text-fintech-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search tokens..." 
            className="w-full bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-xl py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-light-primary/50 dark:focus:ring-fintech-primary/50 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="space-y-4 mb-6">
        
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto no-scrollbar pb-2 xl:pb-0">
                {categories.map((cat) => (
                  <FilterTab 
                    key={cat.value} 
                    label={cat.label} 
                    active={category === cat.value} 
                    onClick={() => {
                      setCategory(cat.value);
                      setPage(1); // Reset ke halaman 1 saat ganti kategori
                    }}
                  />
                ))}
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
                {/* Time Frame Buttons */}
                <div className="flex items-center bg-light-card dark:bg-fintech-card rounded-xl p-1 border border-light-border dark:border-fintech-border shadow-sm">
                    <TimeFrameBtn label="1H" active={timeFrame === '1h'} onClick={() => setTimeFrame('1h')} />
                    <TimeFrameBtn label="1D" active={timeFrame === '24h'} onClick={() => setTimeFrame('24h')} />
                    <TimeFrameBtn label="1W" active={timeFrame === '7d'} onClick={() => setTimeFrame('7d')} />
                </div>
                
                <div className="h-8 w-px bg-light-border dark:bg-fintech-border mx-1 hidden xl:block"></div>

                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-xl text-xs font-semibold text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-fintech-bg/50 transition-colors shadow-sm">
                      <LayoutGrid size={16} className="text-light-muted dark:text-fintech-muted"/>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-light-primary/10 dark:bg-fintech-primary/10 border border-light-primary/20 dark:border-fintech-primary/20 rounded-xl text-xs font-semibold text-light-primary dark:text-fintech-primary shadow-sm">
                      <List size={16}/>
                  </button>
                </div>
            </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-2xl overflow-hidden shadow-lg min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-light-muted dark:text-fintech-muted gap-3">
             <Loader2 className="w-10 h-10 animate-spin text-fintech-primary" />
             <p className="text-sm font-medium">Fetching market data...</p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center h-[400px] text-fintech-danger gap-3 px-4 text-center">
             <AlertCircle className="w-10 h-10" />
             <p className="text-sm font-medium">{error}</p>
             <button 
               onClick={() => { setPage(1); window.location.reload(); }}
               className="px-4 py-2 bg-fintech-primary/10 text-fintech-primary rounded-lg text-xs font-bold mt-2"
             >
               Try Reload
             </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light-bg/50 dark:bg-fintech-bg/30 text-xs text-light-muted dark:text-fintech-muted font-bold uppercase tracking-wider border-b border-light-border dark:border-fintech-border">
                  <th className="py-4 pl-6 pr-4 w-[250px]">Token</th>
                  <th className="py-4 px-4 text-right">Price</th>
                  <th className="py-4 px-4 text-right">{getActivePriceChangeLabel()}</th>
                  <th className="py-4 px-4 text-right">Market Cap</th>
                  <th className="py-4 px-4 text-right">Volume (24h)</th>
                  <th className="py-4 px-4 text-right">Liquidity</th>
                  <th className="py-4 px-4 text-right">Holders</th>
                  <th className="py-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((coin) => {
                  const activeChange = getActivePriceChange(coin);
                  return (
                    <tr key={coin.id} className="group hover:bg-light-bg/50 dark:hover:bg-white/[0.02] border-b border-light-border/50 dark:border-fintech-border/50 last:border-0 transition-all duration-200">
                      
                      {/* Token Info */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-light-bg dark:bg-fintech-bg flex items-center justify-center text-xl border border-light-border dark:border-fintech-border shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                                    <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-light-card dark:bg-fintech-card rounded-full p-0.5 border border-light-border dark:border-fintech-border">
                                    <div className="w-3 h-3 bg-fintech-primary rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-light-text dark:text-white text-base line-clamp-1">{coin.name}</span>
                                    <Zap size={12} className="text-fintech-primary fill-current shrink-0"/>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-light-muted dark:text-fintech-muted mt-0.5">
                                    <span className="font-mono bg-light-bg dark:bg-fintech-bg px-1.5 py-0.5 rounded border border-light-border dark:border-fintech-border/50">{coin.symbol}</span>
                                </div>
                            </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-bold text-light-text dark:text-white text-sm">
                          ${coin.current_price < 1 ? coin.current_price.toFixed(6) : coin.current_price.toLocaleString()}
                        </div>
                      </td>

                      {/* Dynamic Price Change based on TimeFrame */}
                      <td className="py-4 px-4 text-right">
                        <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${activeChange >= 0 ? 'text-fintech-success' : 'text-fintech-danger'}`}>
                            {activeChange >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                            {Math.abs(activeChange).toFixed(2)}%
                        </div>
                      </td>

                      {/* MC */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono text-light-text dark:text-white font-medium">{formatCurrency(coin.market_cap)}</div>
                      </td>

                      {/* Volume */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono text-light-text dark:text-white font-medium">{formatCurrency(coin.total_volume)}</div>
                        <div className={`text-xs font-mono mt-1 ${coin.netFlowPositive ? 'text-fintech-success' : 'text-fintech-danger'}`}>
                            Net: ${coin.netFlow}
                        </div>
                      </td>

                      {/* Liquidity */}
                      <td className="py-4 px-4 text-right font-mono text-light-muted dark:text-fintech-muted">
                        ${coin.liquidity}
                      </td>

                      {/* Holders */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono text-light-text dark:text-white">{coin.holders}</div>
                        <div className={`text-xs font-mono mt-1 ${coin.holderChange >= 0 ? 'text-fintech-success' : 'text-fintech-danger'}`}>
                              {coin.holderChange === 0 ? '-' : (coin.holderChange > 0 ? `+${coin.holderChange}%` : `${coin.holderChange}%`)}
                        </div>
                      </td>

                      {/* Buy Action */}
                      <td className="py-4 px-4 text-right">
                        <button className="px-4 py-2 rounded-xl bg-light-primary dark:bg-fintech-primary text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-light-primary/20 dark:shadow-fintech-primary/20">
                            Trade
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* --- PAGINATION CONTROLS --- */}
        {!loading && !error && (
          <div className="flex items-center justify-between p-4 border-t border-light-border dark:border-fintech-border bg-light-bg/30 dark:bg-fintech-bg/30">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg text-light-muted dark:text-fintech-muted hover:bg-light-bg dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            
            <span className="text-sm font-medium text-light-text dark:text-white">
              Page {page}
            </span>

            <button 
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg text-light-muted dark:text-fintech-muted hover:bg-light-bg dark:hover:bg-white/5 transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Spot;