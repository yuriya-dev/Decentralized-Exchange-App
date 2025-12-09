import { useState, useEffect } from 'react';
import SwapCard from '../components/SwapCard';
import PriceChart from '../components/PriceChart';
import Skeleton from '../components/Skeleton';
import { 
  TrendingUp,
  Clock, Activity, BarChart2, List, FileText,
  Eye, EyeOff, History // Import icon tambahan
} from 'lucide-react';
import { fetchTokens } from '../lib/api';

const Dashboard = () => {
  const [loadingTable, setLoadingTable] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState('BTC');
  const [activeTab, setActiveTab] = useState<'chart' | 'history'>('chart');

  // State baru untuk visibilitas mobile
  // Default false agar mobile lebih bersih (hanya swap), user bisa klik show jika butuh
  const [showChart, setShowChart] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch data real dari backend
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

  const selectedAsset = assets.find(a => a.symbol === selectedAssetSymbol);

  const handleSwapTokenChange = (symbol: string) => {
      setSelectedAssetSymbol(symbol);
  };

  // Mock History Data
  const historyData = [
      { type: 'Swap', from: 'ETH', to: 'USDC', amountIn: '0.5', amountOut: '1,125.00', date: '2 mins ago', hash: '0x123...abc' },
      { type: 'Swap', from: 'USDC', to: 'BTC', amountIn: '500.00', amountOut: '0.012', date: '1 hour ago', hash: '0x456...def' },
      { type: 'Add Liquidity', from: 'ETH', to: 'USDC', amountIn: '1.0', amountOut: '2,250.00', date: '5 hours ago', hash: '0x789...ghi' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10 animate-fade-in px-4 lg:px-0">
      
      {/* Header Info Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border p-2 rounded-xl">
                <img src={selectedAsset?.logo || 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'} className="w-8 h-8 rounded-full"/>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold dark:text-white text-lg">{selectedAsset?.symbol || 'BTC'}</span>
                        <span className="text-xs text-light-muted dark:text-fintech-muted">/ USD</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono dark:text-white font-medium">${selectedAsset?.price?.toLocaleString() || '42,000.00'}</span>
                        <span className={`${(selectedAsset?.changeVal || 0) >= 0 ? 'text-fintech-success' : 'text-fintech-danger'}`}>
                            {(selectedAsset?.changeVal || 0).toFixed(2)}%
                        </span>
                    </div>
                </div>
             </div>
             
             {/* Quick Stats (Hidden on mobile) */}
             <div className="hidden md:flex gap-4 text-xs text-light-muted dark:text-fintech-muted">
                 <div>
                     <div className="mb-1">24h High</div>
                     <div className="font-mono dark:text-white font-medium">${(selectedAsset?.price * 1.05 || 0).toLocaleString()}</div>
                 </div>
                 <div>
                     <div className="mb-1">24h Low</div>
                     <div className="font-mono dark:text-white font-medium">${(selectedAsset?.price * 0.95 || 0).toLocaleString()}</div>
                 </div>
                 <div>
                     <div className="mb-1">24h Vol</div>
                     <div className="font-mono dark:text-white font-medium">$1.2B</div>
                 </div>
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PERUBAHAN POSISI (REORDERING):
              - Mobile: Swap (Kanan) jadi urutan 1 (order-1), Chart (Kiri) jadi urutan 2 (order-2)
              - Desktop: Kembali normal (Swap order-2, Chart order-1)
          */}

          {/* --- RIGHT COLUMN: Swap (Mobile: Order 1, Desktop: Order 2) --- */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
             {/* Swap Card */}
             <div className="lg:sticky lg:top-24">
                <SwapCard onTokenChange={handleSwapTokenChange} />
                
                {/* --- TOMBOL SHOW/HIDE KHUSUS MOBILE --- */}
                <div className="grid grid-cols-2 gap-3 mt-4 lg:hidden">
                    <button 
                        onClick={() => setShowChart(!showChart)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${showChart ? 'bg-fintech-primary text-white border-fintech-primary' : 'bg-light-card dark:bg-fintech-card border-light-border dark:border-fintech-border text-light-muted dark:text-fintech-muted'}`}
                    >
                        {showChart ? <EyeOff size={18}/> : <BarChart2 size={18}/>}
                        <span className="text-sm font-bold">{showChart ? 'Hide Chart' : 'Show Chart'}</span>
                    </button>
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${showHistory ? 'bg-fintech-primary text-white border-fintech-primary' : 'bg-light-card dark:bg-fintech-card border-light-border dark:border-fintech-border text-light-muted dark:text-fintech-muted'}`}
                    >
                        {showHistory ? <EyeOff size={18}/> : <History size={18}/>}
                        <span className="text-sm font-bold">{showHistory ? 'Hide History' : 'Show History'}</span>
                    </button>
                </div>

                {/* Market Stats (Optional below swap) */}
                <div className="mt-6 bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-2xl p-4 hidden lg:block">
                    {/* Note: hidden lg:block ditambahkan agar di mobile tidak terlalu panjang ke bawah, opsional */}
                    <h4 className="text-sm font-bold dark:text-white mb-3 flex items-center gap-2">
                        <TrendingUp size={16} className="text-fintech-accent"/> Market Sentiment
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 flex-1 bg-fintech-success rounded-l-full"></div>
                        <div className="h-2 w-1/4 bg-fintech-danger rounded-r-full"></div>
                    </div>
                    <div className="flex justify-between text-xs text-light-muted dark:text-fintech-muted">
                        <span>75% Buy</span>
                        <span>25% Sell</span>
                    </div>
                </div>
             </div>
          </div>

          {/* --- LEFT COLUMN: Chart & History (Mobile: Order 2, Desktop: Order 1) --- */}
          <div className="lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
             
             {/* Chart Container (Controlled by state on mobile, always visible on desktop) */}
             {/* FIX: Mengubah 'block'/'lg:block' menjadi 'flex'/'lg:flex' agar layout flex-col dan flex-1 di dalamnya bekerja */}
             <div className={`${showChart ? 'flex' : 'hidden'} lg:flex bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-2xl overflow-hidden shadow-sm flex-col h-[500px]`}>
                 {/* Chart Toolbar */}
                 <div className="flex items-center justify-between p-3 border-b border-light-border dark:border-fintech-border bg-light-bg/50 dark:bg-fintech-bg/50">
                     <div className="flex gap-1">
                         <button className="p-1.5 rounded hover:bg-light-border dark:hover:bg-fintech-border transition-colors text-light-primary dark:text-fintech-primary">
                             <BarChart2 size={18} />
                         </button>
                         <div className="w-px h-6 bg-light-border dark:bg-fintech-border mx-2"></div>
                         {['1H', '4H', '1D', '1W'].map(t => (
                             <button key={t} className={`px-3 py-1 text-xs font-medium rounded hover:bg-light-border dark:hover:bg-fintech-border transition-colors ${t === '1D' ? 'text-light-primary dark:text-fintech-primary bg-light-primary/10 dark:bg-fintech-primary/10' : 'text-light-muted dark:text-fintech-muted'}`}>
                                 {t}
                             </button>
                         ))}
                     </div>
                     <div className="flex gap-2">
                         <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-light-border dark:bg-fintech-border rounded text-light-muted dark:text-fintech-muted">
                             <Activity size={14} /> Indicators
                         </button>
                     </div>
                 </div>

                 {/* Main Chart Area */}
                 <div className="flex-1 relative w-full">
                    <PriceChart 
                        symbol={selectedAssetSymbol} 
                        price={selectedAsset?.price} 
                        change={selectedAsset?.changeVal}
                    />
                 </div>
             </div>

             {/* History Section (Controlled by state on mobile, always visible on desktop) */}
             <div className={`${showHistory ? 'block' : 'hidden'} lg:block bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-2xl overflow-hidden min-h-[300px]`}>
                 <div className="flex border-b border-light-border dark:border-fintech-border">
                     <button 
                        onClick={() => setActiveTab('chart')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'chart' ? 'border-fintech-primary text-light-primary dark:text-fintech-primary bg-light-primary/5 dark:bg-fintech-primary/5' : 'border-transparent text-light-muted dark:text-fintech-muted hover:text-light-text dark:hover:text-white'}`}
                     >
                         <List size={16}/> Recent Trades
                     </button>
                     <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-fintech-primary text-light-primary dark:text-fintech-primary bg-light-primary/5 dark:bg-fintech-primary/5' : 'border-transparent text-light-muted dark:text-fintech-muted hover:text-light-text dark:hover:text-white'}`}
                     >
                         <FileText size={16}/> Your Orders
                     </button>
                 </div>

                 <div className="p-0">
                     <table className="w-full text-left">
                         <thead className="bg-light-bg dark:bg-fintech-bg/50 text-xs text-light-muted dark:text-fintech-muted font-medium border-b border-light-border dark:border-fintech-border">
                             <tr>
                                 <th className="px-6 py-3">Type</th>
                                 <th className="px-6 py-3">Amount In</th>
                                 <th className="px-6 py-3">Amount Out</th>
                                 <th className="px-6 py-3">Time</th>
                                 <th className="px-6 py-3 text-right">Hash</th>
                             </tr>
                         </thead>
                         <tbody className="text-sm">
                             {historyData.map((tx, i) => (
                                 <tr key={i} className="border-b border-light-border dark:border-fintech-border last:border-0 hover:bg-light-bg dark:hover:bg-fintech-bg/30 transition-colors">
                                     <td className="px-6 py-4 font-medium dark:text-white">{tx.type}</td>
                                     <td className="px-6 py-4 text-light-muted dark:text-fintech-muted">{tx.amountIn} {tx.from}</td>
                                     <td className="px-6 py-4 text-light-muted dark:text-fintech-muted">{tx.amountOut} {tx.to}</td>
                                     <td className="px-6 py-4 text-light-muted dark:text-fintech-muted flex items-center gap-1">
                                         <Clock size={12}/> {tx.date}
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                         <a href="#" className="text-fintech-primary hover:underline font-mono text-xs">{tx.hash}</a>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>

          </div>

      </div>
    </div>
  );
};

export default Dashboard;