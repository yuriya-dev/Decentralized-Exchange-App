import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Wallet as WalletIcon, Send, ArrowUpRight, ArrowDownRight, 
  MoreHorizontal, Plus, Repeat, ArrowRightLeft, ChevronDown, Copy, X, Loader2 
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { useToast } from '../context/ToastContext';
import { fetchTokens } from '../lib/api';
import { sendNativeToken, sendERC20Token, TOKENS, switchNetwork, NETWORKS } from '../lib/web3';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

const WalletPage = () => {
  const { account, balance, isConnected, chainId } = useWeb3();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Modals & Actions
  const [activeModal, setActiveModal] = useState<'send' | 'receive' | null>(null);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');

  // 1. Init Data
  useEffect(() => {
    const initData = async () => {
        setLoading(true);
        try {
            // Fetch Prices
            const tokenData = await fetchTokens(); 
            
            // --- Kalkulasi Aset (Mock + Real ETH) ---
            const ethPrice = tokenData.find((t: any) => t.symbol === 'ETH')?.price || 2200;
            const ethBalanceVal = parseFloat(balance);
            
            const portfolio = [
                { 
                    name: 'Ethereum', 
                    symbol: 'ETH', 
                    balance: ethBalanceVal, 
                    price: ethPrice, 
                    value: ethBalanceVal * ethPrice, 
                    change: 2.5,
                    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
                },
                { 
                    name: 'USD Coin', 
                    symbol: 'USDC', 
                    balance: 150.5, 
                    price: 1.00, 
                    value: 150.5, 
                    change: 0.01,
                    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
                },
                { 
                    name: 'Bitcoin', 
                    symbol: 'BTC', 
                    balance: 0.005, 
                    price: 42000, 
                    value: 0.005 * 42000, 
                    change: -1.2,
                    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
                },
            ];

            setAssets(portfolio);
            const total = portfolio.reduce((acc, curr) => acc + curr.value, 0);
            setTotalBalanceUSD(total);
            setSelectedToken(portfolio[0]);

            // --- Generate Mock Chart Data (Portfolio History) ---
            // Membuat grafik yang seolah-olah naik turun sesuai timeframe
            const points = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : 30;
            const history = [];
            let currentVal = total * 0.9; // Start slightly lower
            for (let i = 0; i < points; i++) {
                currentVal = currentVal * (1 + (Math.random() - 0.45) * 0.05);
                history.push({ name: i, value: currentVal });
            }
            // Pastikan titik terakhir sama dengan saldo saat ini
            history.push({ name: points, value: total });
            setChartData(history);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (isConnected) initData();
  }, [isConnected, balance, timeframe]);

  const handleSend = async () => {
      if (!ethers.isAddress(recipient)) return addToast("Invalid Address", "error");
      if (parseFloat(amount) <= 0) return addToast("Invalid Amount", "error");
      
      setIsSending(true);
      try {
          // @ts-ignore
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          if (selectedToken.symbol === 'ETH') {
              const tx = await sendNativeToken(signer, recipient, amount);
              addToast(`Sent ${amount} ETH!`, "success");
          } else if (selectedToken.symbol === 'USDC') {
              const tx = await sendERC20Token(signer, TOKENS.USDC, recipient, amount);
              addToast(`Sent ${amount} USDC!`, "success");
          } else {
              addToast("Token transfer simulation only", "info");
          }
          setActiveModal(null);
      } catch (error: any) {
          addToast("Transfer Failed: " + error.message, "error");
      } finally {
          setIsSending(false);
      }
  };

  if (!isConnected) {
      return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-fintech-card rounded-3xl flex items-center justify-center shadow-neon border border-fintech-border">
                  <WalletIcon size={40} className="text-fintech-primary" />
              </div>
              <h2 className="text-3xl font-bold dark:text-white">Connect your wallet</h2>
              <p className="text-light-muted dark:text-fintech-muted max-w-md">Connect your wallet to see your tokens, transactions, and portfolio analytics.</p>
          </div>
      );
  }

  // Calculate Change (Mock)
  const isPositive = chartData.length > 0 && chartData[chartData.length - 1].value >= chartData[0].value;
  const percentageChange = 2.21; // Mock

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
             <div className="flex items-center gap-3 mb-2">
                {/* Avatar Placeholder */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 border-2 border-white dark:border-fintech-bg"></div>
                <span className="text-lg font-medium text-light-muted dark:text-fintech-muted font-mono bg-light-card dark:bg-fintech-card px-3 py-1 rounded-full border border-light-border dark:border-fintech-border flex items-center gap-2">
                    {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                    <Copy size={12} className="cursor-pointer hover:text-fintech-primary" onClick={() => navigator.clipboard.writeText(account || "")}/>
                </span>
             </div>
             <h1 className="text-5xl font-bold dark:text-white tracking-tight mb-2">
                ${totalBalanceUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
             </h1>
             <div className={`flex items-center gap-1 font-medium ${isPositive ? 'text-fintech-success' : 'text-fintech-danger'}`}>
                {isPositive ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                <span>${(totalBalanceUSD * 0.02).toFixed(2)} ({percentageChange}%)</span>
             </div>
          </div>

          {/* Network Badge */}
          <div className="bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium dark:text-white shadow-sm">
             <div className={`w-2 h-2 rounded-full ${chainId === 11155111 ? 'bg-fintech-success' : 'bg-purple-500'}`}></div>
             {chainId === 11155111 ? 'Ethereum Sepolia' : chainId === 80002 ? 'Polygon Amoy' : 'Unknown Network'}
             <ChevronDown size={16} className="text-gray-500"/>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN (Chart & Tokens) --- */}
          <div className="lg:col-span-2 space-y-8">
             
             {/* 1. Portfolio Chart */}
             <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00A3FF" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00A3FF" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={['dataMin', 'dataMax']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(val: number) => [`$${val.toFixed(2)}`, 'Value']}
                            labelStyle={{ display: 'none' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#00A3FF" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorVal)" 
                        />
                    </AreaChart>
                 </ResponsiveContainer>
                 
                 {/* Timeframe Toggles */}
                 <div className="flex gap-2 mt-[-20px] relative z-10">
                    {['1D', '1W', '1M', '1Y'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setTimeframe(t as any)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${timeframe === t ? 'bg-fintech-card border border-fintech-primary text-fintech-primary' : 'text-light-muted dark:text-fintech-muted hover:bg-fintech-card'}`}
                        >
                            {t}
                        </button>
                    ))}
                 </div>
             </div>

             {/* 2. Token List */}
             <div>
                 <h3 className="text-xl font-bold dark:text-white mb-4">Tokens</h3>
                 <div className="bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-2xl overflow-hidden shadow-sm">
                     {assets.map((asset, i) => (
                         <div key={asset.symbol} className="flex items-center justify-between p-4 hover:bg-light-bg dark:hover:bg-fintech-bg/50 transition-colors border-b border-light-border dark:border-fintech-border last:border-0 cursor-pointer">
                             <div className="flex items-center gap-4">
                                 <img src={asset.logo} alt={asset.symbol} className="w-10 h-10 rounded-full"/>
                                 <div>
                                     <div className="font-bold dark:text-white text-lg">{asset.name}</div>
                                     <div className="text-sm text-light-muted dark:text-fintech-muted">{asset.balance.toFixed(4)} {asset.symbol}</div>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <div className="font-bold dark:text-white text-lg">${asset.value.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                                 <div className={`text-sm font-medium ${asset.change >= 0 ? 'text-fintech-success' : 'text-fintech-danger'}`}>
                                     {asset.change >= 0 ? '+' : ''}{asset.change}%
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
          </div>

          {/* --- RIGHT COLUMN (Actions & Activity) --- */}
          <div className="space-y-8">
              
              {/* 3. Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => navigate('/swap')} className="flex flex-col items-start justify-between p-4 h-24 rounded-2xl bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border hover:bg-light-bg dark:hover:bg-fintech-cardHover transition-all group">
                      <div className="p-2 rounded-lg bg-fintech-primary/10 text-fintech-primary group-hover:scale-110 transition-transform">
                          <Repeat size={20} />
                      </div>
                      <span className="font-bold dark:text-white">Swap</span>
                  </button>
                  <button className="flex flex-col items-start justify-between p-4 h-24 rounded-2xl bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border hover:bg-light-bg dark:hover:bg-fintech-cardHover transition-all group opacity-50 cursor-not-allowed">
                      <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500 group-hover:scale-110 transition-transform">
                          <Plus size={20} />
                      </div>
                      <span className="font-bold dark:text-white">Buy</span>
                  </button>
                  <button onClick={() => setActiveModal('send')} className="flex flex-col items-start justify-between p-4 h-24 rounded-2xl bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border hover:bg-light-bg dark:hover:bg-fintech-cardHover transition-all group">
                      <div className="p-2 rounded-lg bg-fintech-accent/10 text-fintech-accent group-hover:scale-110 transition-transform">
                          <Send size={20} />
                      </div>
                      <span className="font-bold dark:text-white">Send</span>
                  </button>
                  <button className="flex flex-col items-start justify-between p-4 h-24 rounded-2xl bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border hover:bg-light-bg dark:hover:bg-fintech-cardHover transition-all group">
                      <div className="p-2 rounded-lg bg-light-muted/20 text-light-muted dark:text-fintech-muted group-hover:scale-110 transition-transform">
                          <MoreHorizontal size={20} />
                      </div>
                      <span className="font-bold dark:text-white">More</span>
                  </button>
              </div>

              {/* Stats Box */}
              <div className="bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-light-muted dark:text-fintech-muted">Swaps this week</span>
                      <span className="font-bold dark:text-white text-lg">12</span>
                  </div>
                  <div className="w-full bg-light-bg dark:bg-fintech-bg h-2 rounded-full overflow-hidden">
                      <div className="bg-fintech-primary h-full w-3/4"></div>
                  </div>
              </div>

              {/* 4. Recent Activity */}
              <div>
                  <h3 className="text-xl font-bold dark:text-white mb-4">Recent activity</h3>
                  <div className="space-y-4">
                      {[1, 2, 3].map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border flex items-center justify-center">
                                  {i === 0 ? <Repeat size={18} className="text-fintech-primary"/> : <ArrowRightLeft size={18} className="text-fintech-accent"/>}
                              </div>
                              <div className="flex-1">
                                  <div className="font-bold dark:text-white text-sm">{i === 0 ? 'Swap ETH for USDC' : 'Receive ETH'}</div>
                                  <div className="text-xs text-light-muted dark:text-fintech-muted">Oct {24 - i}</div>
                              </div>
                              <div className="text-sm font-medium dark:text-white">
                                  {i === 0 ? '-0.05 ETH' : '+0.2 ETH'}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {/* --- MODAL SEND --- */}
      {activeModal === 'send' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-white dark:bg-fintech-card w-full max-w-md rounded-3xl p-6 relative border border-light-border dark:border-fintech-border shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold dark:text-white">Send</h3>
                      <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-light-bg dark:hover:bg-fintech-bg rounded-xl">
                          <X size={20} className="text-gray-500"/>
                      </button>
                  </div>
                  
                  <div className="space-y-4">
                      {/* Asset Select */}
                      <div className="p-3 bg-light-bg dark:bg-fintech-bg rounded-xl border border-light-border dark:border-fintech-border flex items-center justify-between cursor-pointer" onClick={() => setSelectedToken(selectedToken.symbol === 'ETH' ? assets[1] : assets[0])}>
                          <div className="flex items-center gap-3">
                              <img src={selectedToken.logo} className="w-8 h-8 rounded-full"/>
                              <div className="font-bold dark:text-white">{selectedToken.symbol}</div>
                          </div>
                          <div className="text-right">
                              <div className="text-xs text-light-muted dark:text-fintech-muted">Balance</div>
                              <div className="font-mono text-sm dark:text-white">{selectedToken.balance.toFixed(4)}</div>
                          </div>
                      </div>

                      {/* Recipient Input */}
                      <div className="relative">
                          <label className="text-xs font-bold text-light-muted dark:text-fintech-muted ml-1 mb-1 block">To Address</label>
                          <input 
                            type="text" 
                            placeholder="0x..." 
                            className="w-full bg-light-bg dark:bg-fintech-bg border border-light-border dark:border-fintech-border rounded-xl p-4 outline-none focus:border-fintech-primary transition-colors font-mono text-sm dark:text-white"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                          />
                      </div>

                      {/* Amount Input */}
                      <div className="relative">
                          <label className="text-xs font-bold text-light-muted dark:text-fintech-muted ml-1 mb-1 block">Amount</label>
                          <input 
                            type="number" 
                            placeholder="0.0" 
                            className="w-full bg-light-bg dark:bg-fintech-bg border border-light-border dark:border-fintech-border rounded-xl p-4 text-2xl font-bold outline-none focus:border-fintech-primary transition-colors dark:text-white"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                          <button className="absolute right-4 top-9 text-xs font-bold text-fintech-primary bg-fintech-primary/10 px-2 py-1 rounded" onClick={() => setAmount(selectedToken.balance.toString())}>MAX</button>
                      </div>

                      <button 
                        onClick={handleSend}
                        disabled={isSending}
                        className="w-full btn-primary py-4 rounded-xl text-lg font-bold mt-4 flex justify-center items-center gap-2"
                      >
                          {isSending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                          {isSending ? 'Sending...' : 'Confirm'}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default WalletPage;