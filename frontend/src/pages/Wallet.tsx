import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Wallet as WalletIcon, Send, QrCode, Copy, Check, ArrowRightLeft, Globe, Loader2, X } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { useToast } from '../context/ToastContext';
import { fetchTokens } from '../lib/api';
import { sendNativeToken, sendERC20Token, TOKENS, switchNetwork, NETWORKS } from '../lib/web3';
import { ethers } from 'ethers';

// Warna Chart
const COLORS = ['#00A3FF', '#00D1FF', '#FFB039', '#FF4D4D', '#914dff'];

const WalletPage = () => {
  const { account, balance, isConnected, chainId } = useWeb3();
  const { addToast } = useToast();
  
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState(0);
  
  // Modals
  const [activeModal, setActiveModal] = useState<'send' | 'receive' | null>(null);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  
  // Send Form State
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Copy State
  const [copied, setCopied] = useState(false);

  // 1. Fetch Data Aset & Kalkulasi Portofolio
  useEffect(() => {
    const initData = async () => {
        setLoading(true);
        try {
            // Ambil harga real-time
            const tokenData = await fetchTokens(); 
            
            // Simulasi Saldo (Di production, ini fetch dari blockchain via Contract.balanceOf loop)
            // Kita gunakan ETH balance asli dari Web3Context, sisanya mock untuk demo visualisasi
            const ethPrice = tokenData.find((t: any) => t.symbol === 'ETH')?.price || 2000;
            const ethBalanceVal = parseFloat(balance);
            
            const portfolio = [
                { name: 'ETH', symbol: 'ETH', balance: ethBalanceVal, price: ethPrice, value: ethBalanceVal * ethPrice, color: COLORS[0] },
                // Mock tokens lainnya (karena kita di testnet dan user mungkin cuma punya ETH)
                { name: 'USDC', symbol: 'USDC', balance: 150.5, price: 1.00, value: 150.5, color: COLORS[1] },
                { name: 'Bitcoin', symbol: 'BTC', balance: 0.005, price: 42000, value: 0.005 * 42000, color: COLORS[2] },
            ];

            setAssets(portfolio);
            setTotalBalanceUSD(portfolio.reduce((acc, curr) => acc + curr.value, 0));
            // Default token untuk send
            setSelectedToken(portfolio[0]);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (isConnected) initData();
  }, [isConnected, balance]);

  const handleCopy = () => {
      if (account) {
          navigator.clipboard.writeText(account);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

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
              addToast(`Sent ${amount} ETH! Tx: ${tx.hash.substring(0,10)}...`, "success");
          } else if (selectedToken.symbol === 'USDC') {
              // Gunakan address mock USDC Sepolia
              const tx = await sendERC20Token(signer, TOKENS.USDC, recipient, amount);
              addToast(`Sent ${amount} USDC! Tx: ${tx.hash.substring(0,10)}...`, "success");
          } else {
              addToast("Token transfer not supported in this demo", "info");
          }
          setActiveModal(null);
          setAmount('');
          setRecipient('');
      } catch (error: any) {
          console.error(error);
          addToast("Transfer Failed: " + (error.message || "Unknown error"), "error");
      } finally {
          setIsSending(false);
      }
  };

  const handleNetworkSwitch = (netKey: keyof typeof NETWORKS) => {
      switchNetwork(NETWORKS[netKey]);
  };

  if (!isConnected) {
      return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
              <div className="p-6 bg-fintech-primary/10 rounded-full">
                  <WalletIcon size={48} className="text-fintech-primary" />
              </div>
              <h2 className="text-2xl font-bold dark:text-white">Wallet Not Connected</h2>
              <p className="text-light-muted dark:text-fintech-muted">Please connect your wallet to view your portfolio.</p>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pb-10">
      
      {/* Left Column: Asset Allocation & Actions */}
      <div className="order-2 lg:order-1 lg:col-span-8 space-y-8">
         
         {/* Portfolio Summary Card */}
         <div className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fintech-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                <div>
                    <h2 className="text-light-muted dark:text-fintech-muted text-sm font-medium mb-1">Total Balance</h2>
                    <h1 className="text-4xl font-bold dark:text-white">${totalBalanceUSD.toLocaleString(undefined, {minimumFractionDigits: 2})}</h1>
                    <div className="flex items-center gap-2 mt-2 text-fintech-success text-sm font-medium bg-fintech-success/10 px-2 py-1 rounded w-fit">
                        <span>+2.5%</span> <span>vs last week</span>
                    </div>
                </div>
                
                <div className="flex gap-3 mt-6 md:mt-0">
                    <button onClick={() => setActiveModal('send')} className="flex items-center gap-2 btn-primary px-6">
                        <Send size={18} /> Send
                    </button>
                    <button onClick={() => setActiveModal('receive')} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-fintech-primary text-fintech-primary hover:bg-fintech-primary/10 transition-colors font-bold">
                        <QrCode size={18} /> Receive
                    </button>
                </div>
            </div>
         </div>

         {/* Asset Allocation Chart */}
         <div className="glass-panel p-6">
            <h3 className="font-bold text-lg dark:text-white mb-6">Asset Allocation</h3>
            <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={assets}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {assets.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }}
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
         </div>

         {/* Asset List */}
         <div className="glass-panel p-6">
            <h3 className="font-bold text-lg dark:text-white mb-4">Your Assets</h3>
            <div className="space-y-4">
                {assets.map((asset) => (
                    <div key={asset.symbol} className="flex justify-between items-center p-4 bg-light-bg dark:bg-fintech-bg/50 rounded-xl hover:bg-light-primary/5 dark:hover:bg-fintech-cardHover transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: asset.color }}>
                                {asset.symbol[0]}
                            </div>
                            <div>
                                <div className="font-bold dark:text-white">{asset.name}</div>
                                <div className="text-xs text-light-muted dark:text-fintech-muted">{asset.balance} {asset.symbol}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold dark:text-white">${asset.value.toLocaleString()}</div>
                            <div className="text-xs text-light-muted dark:text-fintech-muted">${asset.price}/token</div>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* Right Column: Network & Tools */}
      <div className="order-1 lg:order-2 lg:col-span-4 space-y-8">
          
          {/* Network Switcher Card */}
          <div className="glass-panel p-6">
              <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                  <Globe size={18} className="text-fintech-primary"/> Network
              </h3>
              <div className="space-y-2">
                  <button 
                    onClick={() => handleNetworkSwitch('SEPOLIA')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${chainId === 11155111 ? 'border-fintech-success bg-fintech-success/10 text-fintech-success' : 'border-light-border dark:border-fintech-border text-light-muted dark:text-fintech-muted hover:border-fintech-primary hover:text-fintech-primary'}`}
                  >
                      <span className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${chainId === 11155111 ? 'bg-fintech-success' : 'bg-gray-400'}`}></div>
                          Sepolia Testnet
                      </span>
                      {chainId === 11155111 && <Check size={16}/>}
                  </button>
                  
                  <button 
                    onClick={() => handleNetworkSwitch('POLYGON_AMOY')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${chainId === 80002 ? 'border-purple-500 bg-purple-500/10 text-purple-500' : 'border-light-border dark:border-fintech-border text-light-muted dark:text-fintech-muted hover:border-purple-500 hover:text-purple-500'}`}
                  >
                      <span className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${chainId === 80002 ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                          Polygon Amoy
                      </span>
                      {chainId === 80002 && <Check size={16}/>}
                  </button>
              </div>
          </div>

          {/* Quick Actions / History Placeholder */}
          <div className="glass-panel p-6">
              <h3 className="font-bold dark:text-white mb-4">Recent Activity</h3>
              <div className="text-center py-8 text-light-muted dark:text-fintech-muted text-sm">
                  <ArrowRightLeft className="mx-auto mb-2 opacity-50" size={32}/>
                  No recent transactions found.
              </div>
          </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Receive Modal */}
      {activeModal === 'receive' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-white dark:bg-fintech-card w-full max-w-md rounded-2xl p-6 relative border border-fintech-border shadow-2xl">
                  <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-fintech-bg rounded-lg">
                      <X size={24} className="text-gray-500"/>
                  </button>
                  
                  <h3 className="text-xl font-bold text-center mb-6 dark:text-white">Receive Assets</h3>
                  
                  <div className="flex justify-center mb-6">
                      <div className="p-4 bg-white rounded-xl shadow-inner">
                          {/* QR Code Placeholder (Using API for demo) */}
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${account}`} 
                            alt="Wallet QR" 
                            className="w-48 h-48"
                          />
                      </div>
                  </div>
                  
                  <div className="bg-light-bg dark:bg-fintech-bg p-3 rounded-xl flex items-center justify-between border border-light-border dark:border-fintech-border">
                      <span className="font-mono text-sm truncate dark:text-white w-4/5">{account}</span>
                      <button onClick={handleCopy} className="p-2 hover:bg-gray-200 dark:hover:bg-fintech-card rounded-lg transition-colors">
                          {copied ? <Check size={18} className="text-green-500"/> : <Copy size={18} className="text-fintech-primary"/>}
                      </button>
                  </div>
                  
                  <p className="text-center text-xs text-gray-500 mt-4">
                      Send only supported tokens (Sepolia ETH, USDC, etc.) to this address.
                  </p>
              </div>
          </div>
      )}

      {/* 2. Send Modal */}
      {activeModal === 'send' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
              <div className="bg-white dark:bg-fintech-card w-full max-w-md rounded-2xl p-6 relative border border-fintech-border shadow-2xl">
                  <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-fintech-bg rounded-lg">
                      <X size={24} className="text-gray-500"/>
                  </button>
                  
                  <h3 className="text-xl font-bold mb-6 dark:text-white">Send Assets</h3>
                  
                  <div className="space-y-4">
                      {/* Asset Selector */}
                      <div>
                          <label className="block text-sm text-gray-500 mb-1">Asset</label>
                          <div className="flex gap-2">
                              {assets.map(asset => (
                                  <button 
                                    key={asset.symbol}
                                    onClick={() => setSelectedToken(asset)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${selectedToken.symbol === asset.symbol ? 'bg-fintech-primary/10 border-fintech-primary text-fintech-primary' : 'border-light-border dark:border-fintech-border hover:bg-gray-50 dark:hover:bg-fintech-bg dark:text-white'}`}
                                  >
                                      {asset.symbol}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Recipient */}
                      <div>
                          <label className="block text-sm text-gray-500 mb-1">Recipient Address</label>
                          <input 
                            type="text" 
                            placeholder="0x..." 
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="input-field w-full text-sm py-3"
                          />
                      </div>

                      {/* Amount */}
                      <div>
                          <div className="flex justify-between mb-1">
                              <label className="block text-sm text-gray-500">Amount</label>
                              <span className="text-xs text-gray-500">Bal: {selectedToken?.balance}</span>
                          </div>
                          <input 
                            type="number" 
                            placeholder="0.0" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input-field w-full text-sm py-3"
                          />
                      </div>

                      <button 
                        onClick={handleSend}
                        disabled={isSending}
                        className="w-full btn-primary mt-4 py-3 flex items-center justify-center gap-2"
                      >
                          {isSending ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>}
                          {isSending ? 'Sending...' : 'Confirm Send'}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default WalletPage;