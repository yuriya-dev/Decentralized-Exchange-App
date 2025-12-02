import { useState, useEffect } from 'react';
import SwapCard from '../components/SwapCard';
import PriceChart from '../components/PriceChart';
import Skeleton from '../components/Skeleton';
import { Rocket, TrendingUp, ArrowUpRight, Filter, MoreHorizontal, ArrowDownRight } from 'lucide-react';
import { fetchTokens } from '../lib/api';

const Dashboard = () => {
  const [loadingTable, setLoadingTable] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'gainers' | 'losers'>('all');
  
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState('BTC');

  useEffect(() => {
    const loadAssets = async () => {
        setLoadingTable(true);
        try {
            const data = await fetchTokens();
            if (data && data.length > 0) {
                setAssets(data);
                if (!selectedAssetSymbol) setSelectedAssetSymbol(data[0].symbol);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingTable(false);
        }
    };
    loadAssets();
  }, []);

  const filteredAssets = assets.filter(asset => {
      if (filterMode === 'gainers') return asset.changeVal > 0;
      if (filterMode === 'losers') return asset.changeVal < 0;
      return true;
  });

  const formatMarketCap = (num: number) => {
      if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
      return `$${num.toLocaleString()}`;
  };

  const selectedAsset = assets.find(a => a.symbol === selectedAssetSymbol);

  // Fungsi callback untuk menangani perubahan token dari SwapCard
  const handleSwapTokenChange = (symbol: string) => {
      setSelectedAssetSymbol(symbol);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pb-10">
      
      {/* --- LEFT COLUMN --- */}
      <div className="order-2 lg:order-1 lg:col-span-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white tracking-tight">Market Overview</h1>
            <p className="text-light-muted dark:text-fintech-muted text-sm mt-1">Live market data powered by <span className="font-bold text-fintech-primary">CoinGecko Proxy</span>.</p>
          </div>
          <div className="flex gap-2 bg-light-card dark:bg-fintech-card p-1 rounded-xl border border-light-border dark:border-fintech-border shadow-sm">
             {['All', 'Gainers', 'Losers'].map((mode) => (
                 <button 
                    key={mode}
                    onClick={() => setFilterMode(mode.toLowerCase() as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterMode === mode.toLowerCase() ? 'bg-light-primary dark:bg-fintech-primary text-white shadow' : 'text-light-muted dark:text-fintech-muted hover:bg-light-bg dark:hover:bg-fintech-bg'}`}
                 >
                     {mode}
                 </button>
             ))}
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-[450px] lg:h-[500px] glass-panel p-1 flex flex-col overflow-hidden">
           <PriceChart 
              symbol={selectedAssetSymbol} 
              price={selectedAsset?.price} 
              change={selectedAsset?.changeVal}
           />
        </div>

        {/* Table */}
        <div className="glass-panel p-6 overflow-hidden">
          <div className="flex justify-between mb-6 items-center">
            <h3 className="font-bold text-lg dark:text-white">Top Assets</h3>
            <span className="text-xs text-light-muted dark:text-fintech-muted bg-light-bg dark:bg-fintech-bg px-2 py-1 rounded border border-light-border dark:border-fintech-border">
                Showing Top 5
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-light-muted dark:text-fintech-muted text-xs uppercase tracking-wider border-b border-light-border dark:border-fintech-border">
                  <th className="pb-4 pl-4 font-medium">Name</th>
                  <th className="pb-4 font-medium">Price</th>
                  <th className="pb-4 font-medium">24h Change</th>
                  <th className="pb-4 font-medium">Market Cap</th>
                  <th className="pb-4 font-medium">Trend</th>
                  <th className="pb-4 font-medium text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium dark:text-white">
                {loadingTable ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-light-border/50 dark:border-fintech-border/50">
                      <td className="py-4 pl-4"><div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-xl"/><div className="space-y-2"><Skeleton className="w-24 h-4"/><Skeleton className="w-12 h-3"/></div></div></td>
                      <td className="py-4"><Skeleton className="w-20 h-4"/></td>
                      <td className="py-4"><Skeleton className="w-16 h-4"/></td>
                      <td className="py-4"><Skeleton className="w-24 h-4"/></td>
                      <td className="py-4"><Skeleton className="w-16 h-4 rounded-full"/></td>
                      <td className="py-4 pr-4 flex justify-end"><Skeleton className="w-8 h-8 rounded-lg"/></td>
                    </tr>
                  ))
                ) : (
                  filteredAssets.slice(0, 5).map((coin, i) => (
                    <tr 
                        key={i} 
                        onClick={() => setSelectedAssetSymbol(coin.symbol)}
                        className={`
                            group border-b border-light-border/50 dark:border-fintech-border/50 last:border-0 cursor-pointer transition-colors
                            ${selectedAssetSymbol === coin.symbol 
                                ? 'bg-light-primary/5 dark:bg-fintech-primary/10 border-l-2 border-l-fintech-primary' 
                                : 'hover:bg-light-bg dark:hover:bg-fintech-cardHover'
                            }
                        `}
                    >
                      <td className="py-4 pl-4 flex items-center gap-3">
                        <img src={coin.logo} alt={coin.symbol} className="w-10 h-10 rounded-full shadow-md"/>
                        <div>
                          <div className="font-bold">{coin.name}</div>
                          <div className="text-xs text-light-muted dark:text-fintech-muted">{coin.symbol}</div>
                        </div>
                      </td>
                      <td className="py-4 font-mono font-medium">${coin.price.toLocaleString()}</td>
                      <td className={`py-4 flex items-center gap-1 ${coin.changeVal < 0 ? 'text-fintech-danger' : 'text-fintech-success'}`}>
                          {coin.changeVal < 0 ? <ArrowDownRight size={14}/> : <ArrowUpRight size={14}/>}
                          {Math.abs(coin.changeVal).toFixed(2)}%
                      </td>
                      <td className="py-4 text-light-muted dark:text-fintech-muted">{formatMarketCap(coin.marketCap)}</td>
                      <td className="py-4">
                          <div className={`h-1 w-16 rounded-full ${coin.changeVal < 0 ? 'bg-fintech-danger/20' : 'bg-fintech-success/20'} overflow-hidden`}>
                              <div className={`h-full ${coin.changeVal < 0 ? 'bg-fintech-danger' : 'bg-fintech-success'}`} style={{ width: `${Math.min(Math.abs(coin.changeVal) * 10, 100)}%` }}></div>
                          </div>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <button className="p-2 rounded-lg hover:bg-light-primary/10 dark:hover:bg-fintech-primary/10 hover:text-light-primary dark:hover:text-fintech-primary transition-colors text-light-muted dark:text-fintech-muted">
                          <MoreHorizontal size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN --- */}
      <div className="order-1 lg:order-2 lg:col-span-4 space-y-8">
        {/* Pass callback ke SwapCard */}
        <SwapCard onTokenChange={handleSwapTokenChange} />
        
        <div className="glass-panel p-6">
          <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-fintech-accent"/> Top Gainers
          </h3>
          <div className="space-y-4">
              {[...assets].sort((a,b) => b.changeVal - a.changeVal).slice(0, 3).map((coin, idx) => (
                 <div key={idx} className="flex justify-between items-center cursor-pointer hover:opacity-80" onClick={() => setSelectedAssetSymbol(coin.symbol)}>
                    <div className="flex items-center gap-2">
                         <div className="font-bold text-sm text-light-muted dark:text-fintech-muted">#{idx+1}</div>
                         <img src={coin.logo} className="w-5 h-5 rounded-full"/>
                         <div className="font-bold text-sm dark:text-white">{coin.name}</div>
                    </div>
                    <div className={`text-xs font-bold text-fintech-success`}>
                        +{coin.changeVal.toFixed(2)}%
                    </div>
                 </div>
              ))}
          </div>
        </div>

        <div className="relative rounded-2xl p-6 overflow-hidden shadow-neon-accent group">
           <div className="absolute inset-0 bg-accent-gradient opacity-90 transition-opacity"></div>
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
           <div className="relative z-10 text-white">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Rocket size={24} className="text-white" />
             </div>
             <h3 className="font-bold text-xl mb-1">Go Premium</h3>
             <p className="text-sm text-white/80 mb-4 leading-relaxed">Upgrade to see advanced analytics.</p>
             <button className="w-full py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors shadow-lg">
               Upgrade Now
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;