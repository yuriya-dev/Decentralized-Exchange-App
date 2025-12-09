import React, { useState } from 'react';
import { 
  Wallet, TrendingUp, Plus, Filter, Info, 
  ArrowUpRight, Layers, Search, Settings, 
  ChevronDown, DollarSign, Sparkles
} from 'lucide-react';

// --- Tipe Data Dummy ---
interface Pool {
  id: string;
  pair: string;
  version: string;
  fee: string;
  apr: string;
  tvl?: string;
  rewardApr?: string; // APR tambahan (misal token reward)
  isHot?: boolean;
}

const Earn = () => {
  const [filterStatus, setFilterStatus] = useState('active');

  // --- Data Dummy (Mirip referensi tapi dengan tema kita) ---
  const rewardPools: Pool[] = [
    { id: '1', pair: 'USDC / USDT', version: 'v4', fee: '0.01%', apr: '4.8%', rewardApr: '+2.1% UNI' },
    { id: '2', pair: 'ETH / USDT', version: 'v3', fee: '0.3%', apr: '12.5%', rewardApr: '+5.4% LDO' },
  ];

  const topPools: Pool[] = [
    { id: '3', pair: 'ETH / USDC', version: 'v3', fee: '0.05%', apr: '30.79%', tvl: '$450M' },
    { id: '4', pair: 'WBTC / ETH', version: 'v3', fee: '0.3%', apr: '7.38%', tvl: '$120M' },
    { id: '5', pair: 'SOL / USDC', version: 'v3', fee: '0.3%', apr: '18.22%', tvl: '$85M' },
    { id: '6', pair: 'LINK / ETH', version: 'v2', fee: '0.3%', apr: '4.15%', tvl: '$40M' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 lg:px-0 mt-6 animate-fade-in">
      
      {/* --- HEADER: Rewards Section --- */}
      <div className="mb-8">
        <div className="bg-light-card dark:bg-[#0d0d12] border border-light-border dark:border-fintech-border/50 rounded-2xl p-6 relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-fintech-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div>
                    <div className="flex items-center gap-2 text-light-muted dark:text-fintech-muted mb-1">
                        <Sparkles size={16} className="text-pink-500" />
                        <span className="text-sm font-medium">Rewards Earned</span>
                        <Info size={14} className="cursor-help" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h1 className="text-4xl font-bold dark:text-white">0.00 <span className="text-xl text-light-muted dark:text-fintech-muted">USD</span></h1>
                    </div>
                    <p className="text-xs text-light-muted dark:text-fintech-muted mt-2 flex items-center gap-1 hover:text-fintech-primary cursor-pointer transition-colors">
                        Find pools with rewards <ArrowUpRight size={12} />
                    </p>
                </div>

                <button 
                    disabled 
                    className="px-6 py-3 rounded-xl border border-light-border dark:border-fintech-border bg-light-bg dark:bg-white/5 text-light-muted dark:text-fintech-muted text-sm font-bold cursor-not-allowed opacity-70"
                >
                    Collect Rewards
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- KOLOM KIRI: Your Positions (2/3 width) --- */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Your Positions</h2>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-fintech-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-fintech-primary/20 hover:opacity-90 transition-all">
                    <Plus size={16} /> New
                </button>
                
                <div className="h-9 w-px bg-light-border dark:bg-fintech-border mx-1"></div>

                <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-xl text-sm font-medium text-light-muted dark:text-fintech-muted hover:text-white hover:border-fintech-primary/50 transition-all">
                        Status <ChevronDown size={14} />
                    </button>
                    {/* Dropdown Mockup */}
                    <div className="absolute top-full left-0 mt-2 w-32 bg-fintech-card border border-fintech-border rounded-xl shadow-xl p-1 hidden group-hover:block z-20">
                        <div className="px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-white cursor-pointer">Open</div>
                        <div className="px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-white cursor-pointer">Closed</div>
                    </div>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-xl text-sm font-medium text-light-muted dark:text-fintech-muted hover:text-white hover:border-fintech-primary/50 transition-all">
                    Protocol <ChevronDown size={14} />
                </button>
            </div>

            {/* Empty State Card (Sesuai Referensi) */}
            <div className="border border-dashed border-light-border dark:border-fintech-border/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-light-card/50 dark:bg-fintech-card/30 min-h-[300px]">
                <div className="w-16 h-16 bg-light-bg dark:bg-fintech-bg rounded-2xl flex items-center justify-center mb-6 border border-light-border dark:border-fintech-border">
                    <Layers size={32} className="text-light-muted dark:text-fintech-muted" />
                </div>
                <h3 className="text-lg font-bold dark:text-white mb-2">No active positions</h3>
                <p className="text-light-muted dark:text-fintech-muted max-w-sm mb-8 text-sm">
                    You don't have any liquidity positions yet. Create a new position to start earning fees and rewards.
                </p>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border text-sm font-bold text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-white/5 transition-colors">
                        Explore Pools
                    </button>
                    <button className="px-5 py-2.5 rounded-xl bg-fintech-primary/10 border border-fintech-primary/20 text-sm font-bold text-fintech-primary hover:bg-fintech-primary/20 transition-colors">
                        Create Position
                    </button>
                </div>
            </div>

            {/* Banner Bawah */}
            <div className="flex items-center justify-between p-4 bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-xl">
                 <div className="flex items-center gap-3">
                    <Info size={18} className="text-light-muted dark:text-fintech-muted" />
                    <span className="text-sm text-light-muted dark:text-fintech-muted">
                        Looking for your closed positions? Filter by status above.
                    </span>
                 </div>
                 <button className="text-light-muted dark:text-fintech-muted hover:text-white">
                    <span className="sr-only">Dismiss</span>
                    &times;
                 </button>
            </div>
        </div>

        {/* --- KOLOM KANAN: Sidebar Pools (1/3 width) --- */}
        <div className="space-y-8">
            
            {/* Section: Pools with Rewards */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-light-muted dark:text-fintech-muted uppercase tracking-wider">Pools with Rewards</h3>
                </div>
                <div className="bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-xl overflow-hidden">
                    {rewardPools.map((pool, idx) => (
                        <div key={pool.id} className={`p-4 hover:bg-light-bg dark:hover:bg-white/5 transition-colors cursor-pointer ${idx !== rewardPools.length -1 ? 'border-b border-light-border dark:border-fintech-border/50' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {/* Mock Icons */}
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-fintech-card"></div>
                                        <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-fintech-card"></div>
                                    </div>
                                    <span className="font-bold text-sm dark:text-white">{pool.pair}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-bold text-fintech-success">{pool.apr}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex gap-2">
                                    <span className="bg-light-bg dark:bg-black/40 px-1.5 py-0.5 rounded border border-light-border dark:border-white/10 text-light-muted dark:text-fintech-muted">{pool.version}</span>
                                    <span className="bg-light-bg dark:bg-black/40 px-1.5 py-0.5 rounded border border-light-border dark:border-white/10 text-light-muted dark:text-fintech-muted">{pool.fee}</span>
                                </div>
                                <span className="font-bold text-pink-500 text-[10px] bg-pink-500/10 px-2 py-0.5 rounded-full">
                                    {pool.rewardApr}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div className="p-3 text-center border-t border-light-border dark:border-fintech-border/50">
                        <button className="text-xs font-bold text-fintech-primary hover:text-fintech-primary/80 flex items-center justify-center gap-1">
                            Explore All <ArrowUpRight size={12}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Section: Top Pools by TVL */}
            <div>
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-light-muted dark:text-fintech-muted uppercase tracking-wider">Top Pools by TVL</h3>
                </div>
                <div className="bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-xl overflow-hidden">
                    {topPools.map((pool, idx) => (
                        <div key={pool.id} className={`p-4 hover:bg-light-bg dark:hover:bg-white/5 transition-colors cursor-pointer ${idx !== topPools.length -1 ? 'border-b border-light-border dark:border-fintech-border/50' : ''}`}>
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-light-bg dark:bg-fintech-bg flex items-center justify-center border border-light-border dark:border-fintech-border text-xs font-bold text-light-text dark:text-white">
                                        {pool.pair.substring(0,1)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm dark:text-white">{pool.pair}</span>
                                            <span className="text-[10px] text-light-muted dark:text-fintech-muted bg-light-bg dark:bg-white/10 px-1 rounded">{pool.fee}</span>
                                        </div>
                                        <div className="text-xs text-light-muted dark:text-fintech-muted mt-0.5">TVL: {pool.tvl}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-light-text dark:text-white">{pool.apr} APR</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Earn;