import React, { useState } from 'react';
import { 
  ArrowRight, ArrowDown, Wallet, RefreshCw, 
  CheckCircle2, ExternalLink, AlertCircle, 
  Settings, ChevronDown, Info, ArrowLeftRight
} from 'lucide-react';

// --- Types ---
interface Chain {
  id: string;
  name: string;
  icon: string; // Emoji as mock icon
  explorerUrl: string;
}

interface Token {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  icon: string;
}

const Bridge = () => {
  // --- Mock Data ---
  const chains: Chain[] = [
    { id: 'eth', name: 'Ethereum', icon: '🔷', explorerUrl: 'https://etherscan.io/tx/' },
    { id: 'bsc', name: 'BSC', icon: '🟨', explorerUrl: 'https://bscscan.com/tx/' },
    { id: 'poly', name: 'Polygon', icon: '💜', explorerUrl: 'https://polygonscan.com/tx/' },
    { id: 'arb', name: 'Arbitrum', icon: '🔵', explorerUrl: 'https://arbiscan.io/tx/' },
  ];

  const tokens: Token[] = [
    { id: 'usdc', symbol: 'USDC', name: 'USD Coin', balance: 2500.50, icon: '$' },
    { id: 'eth', symbol: 'ETH', name: 'Ethereum', balance: 1.45, icon: 'Ξ' },
    { id: 'usdt', symbol: 'USDT', name: 'Tether USD', balance: 500.00, icon: '₮' },
  ];

  // --- State Management ---
  const [fromChain, setFromChain] = useState<Chain>(chains[0]);
  const [toChain, setToChain] = useState<Chain>(chains[2]);
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);
  const [amount, setAmount] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');

  // --- Handlers ---
  const handleBridge = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (parseFloat(amount) > selectedToken.balance) return;

    setStep('processing');
    setIsLoading(true);

    // Simulasi Proses Bridge
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
      setTxHash('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
    }, 3000); // 3 detik delay
  };

  const handleSwapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const resetForm = () => {
    setStep('input');
    setAmount('');
    setTxHash(null);
  };

  return (
    <div className="max-w-xl mx-auto pb-10 px-4 lg:px-0 mt-8 animate-fade-in">
      
      {/* --- Page Header --- */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Bridge Assets</h1>
          <p className="text-sm text-light-muted dark:text-fintech-muted">Transfer tokens across networks</p>
        </div>
        <div className="flex gap-2">
            <button className="p-2 rounded-xl bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border text-light-muted dark:text-fintech-muted hover:text-white transition-colors">
                <RefreshCw size={18} />
            </button>
            <button className="p-2 rounded-xl bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border text-light-muted dark:text-fintech-muted hover:text-white transition-colors">
                <Settings size={18} />
            </button>
        </div>
      </div>

      {/* --- Main Card --- */}
      <div className="bg-light-card dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-3xl p-2 shadow-2xl shadow-fintech-primary/5 relative overflow-hidden">
        
        {/* Background Gradient Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-fintech-primary to-transparent opacity-50"></div>

        {step === 'success' ? (
          // --- SUCCESS STATE ---
          <div className="p-8 flex flex-col items-center text-center animate-scale-in">
            <div className="w-20 h-20 bg-fintech-success/10 rounded-full flex items-center justify-center mb-6 border border-fintech-success/20">
              <CheckCircle2 size={40} className="text-fintech-success animate-bounce-slow" />
            </div>
            <h2 className="text-2xl font-bold dark:text-white mb-2">Bridge Completed!</h2>
            <p className="text-light-muted dark:text-fintech-muted mb-6">
              You successfully bridged <span className="text-white font-bold">{amount} {selectedToken.symbol}</span> from {fromChain.name} to {toChain.name}.
            </p>
            
            <div className="w-full bg-light-bg dark:bg-black/30 rounded-xl p-4 mb-6 border border-light-border dark:border-fintech-border/50">
               <div className="flex justify-between items-center text-sm mb-2">
                 <span className="text-light-muted dark:text-fintech-muted">Status</span>
                 <span className="text-fintech-success font-bold">Success</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-light-muted dark:text-fintech-muted">Transaction Hash</span>
                 <a 
                   href={`${fromChain.explorerUrl}${txHash}`} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center gap-1 text-fintech-primary hover:underline truncate max-w-[150px]"
                 >
                   {txHash?.substring(0, 6)}...{txHash?.substring(txHash.length - 4)}
                   <ExternalLink size={12} />
                 </a>
               </div>
            </div>

            <button 
              onClick={resetForm}
              className="w-full py-4 bg-fintech-primary hover:bg-fintech-primary/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-fintech-primary/20"
            >
              Bridge More Assets
            </button>
          </div>
        ) : (
          // --- INPUT STATE ---
          <div className="p-4 space-y-1">
            
            {/* FROM SECTION */}
            <div className="bg-light-bg dark:bg-[#0d0d12] rounded-2xl p-4 border border-light-border dark:border-fintech-border/50 hover:border-fintech-primary/30 transition-colors">
              <div className="flex justify-between mb-3">
                <span className="text-xs font-bold text-light-muted dark:text-fintech-muted uppercase tracking-wider">From Network</span>
                <span className="text-xs font-medium text-light-muted dark:text-fintech-muted flex items-center gap-1">
                  <Wallet size={12} /> Balance: {selectedToken.balance}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                 {/* Chain Selector */}
                 <button className="flex items-center gap-2 bg-light-card dark:bg-fintech-card hover:bg-light-border dark:hover:bg-white/10 border border-light-border dark:border-fintech-border px-3 py-2 rounded-xl transition-all min-w-[140px]">
                    <span className="text-xl">{fromChain.icon}</span>
                    <span className="font-bold text-sm dark:text-white flex-1 text-left">{fromChain.name}</span>
                    <ChevronDown size={16} className="text-light-muted dark:text-fintech-muted" />
                 </button>

                 {/* Amount Input */}
                 <div className="flex-1 text-right">
                    <input 
                      type="number" 
                      placeholder="0.0" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent text-right text-3xl font-bold dark:text-white placeholder-light-muted dark:placeholder-fintech-muted/30 focus:outline-none"
                    />
                 </div>
              </div>

              {/* Token Selector */}
              <div className="flex justify-end">
                 <button className="flex items-center gap-2 bg-light-card dark:bg-fintech-card hover:bg-light-border dark:hover:bg-white/10 border border-light-border dark:border-fintech-border px-3 py-1.5 rounded-full transition-all">
                    <div className="w-5 h-5 rounded-full bg-fintech-primary/20 flex items-center justify-center text-xs font-bold text-fintech-primary">
                      {selectedToken.icon}
                    </div>
                    <span className="font-bold text-sm dark:text-white">{selectedToken.symbol}</span>
                    <ChevronDown size={14} className="text-light-muted dark:text-fintech-muted" />
                 </button>
              </div>
            </div>

            {/* SWAP ICON */}
            <div className="relative h-4 z-10">
              <button 
                onClick={handleSwapChains}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-light-card dark:bg-fintech-card border-4 border-light-bg dark:border-[#0d0d12] rounded-xl flex items-center justify-center text-light-muted dark:text-fintech-muted hover:text-fintech-primary hover:border-fintech-bg transition-all shadow-sm"
              >
                <ArrowDown size={18} />
              </button>
            </div>

            {/* TO SECTION */}
            <div className="bg-light-bg dark:bg-[#0d0d12] rounded-2xl p-4 border border-light-border dark:border-fintech-border/50 hover:border-fintech-primary/30 transition-colors">
              <div className="flex justify-between mb-3">
                <span className="text-xs font-bold text-light-muted dark:text-fintech-muted uppercase tracking-wider">To Network</span>
              </div>
              
               <div className="flex items-center gap-4">
                 {/* Chain Selector */}
                 <button className="flex items-center gap-2 bg-light-card dark:bg-fintech-card hover:bg-light-border dark:hover:bg-white/10 border border-light-border dark:border-fintech-border px-3 py-2 rounded-xl transition-all min-w-[140px]">
                    <span className="text-xl">{toChain.icon}</span>
                    <span className="font-bold text-sm dark:text-white flex-1 text-left">{toChain.name}</span>
                    <ChevronDown size={16} className="text-light-muted dark:text-fintech-muted" />
                 </button>

                 {/* Estimated Output */}
                 <div className="flex-1 text-right">
                    <div className="text-3xl font-bold text-light-muted dark:text-fintech-muted/50">
                        {amount ? (parseFloat(amount) * 0.999).toFixed(4) : '0.0'}
                    </div>
                 </div>
              </div>
            </div>

            {/* SUMMARY & ACTION */}
            <div className="pt-4 px-2">
                <div className="flex flex-col gap-2 mb-6">
                    <div className="flex justify-between text-xs">
                        <span className="text-light-muted dark:text-fintech-muted flex items-center gap-1">
                            Bridge Fee <Info size={12} />
                        </span>
                        <span className="dark:text-white font-medium">~$1.50 (0.1%)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-light-muted dark:text-fintech-muted">Est. Arrival Time</span>
                        <span className="dark:text-white font-medium">~2 mins</span>
                    </div>
                </div>

                <button 
                  onClick={handleBridge}
                  disabled={isLoading || !amount || parseFloat(amount) > selectedToken.balance || parseFloat(amount) <= 0}
                  className={`
                    w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                    ${isLoading 
                        ? 'bg-light-border dark:bg-white/10 text-light-muted dark:text-white/50 cursor-not-allowed' 
                        : (!amount || parseFloat(amount) > selectedToken.balance)
                            ? 'bg-light-border dark:bg-fintech-card text-light-muted dark:text-fintech-muted cursor-not-allowed'
                            : 'bg-fintech-primary hover:bg-fintech-primary/90 text-white shadow-fintech-primary/20 hover:scale-[1.01] active:scale-[0.99]'
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                       <RefreshCw className="animate-spin" size={20} /> Bridging...
                    </>
                  ) : parseFloat(amount) > selectedToken.balance ? (
                    "Insufficient Balance"
                  ) : !amount ? (
                    "Enter Amount"
                  ) : (
                    "Bridge Assets"
                  )}
                </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Footer Note --- */}
      <div className="mt-6 text-center">
         <p className="text-xs text-light-muted dark:text-fintech-muted flex items-center justify-center gap-1">
            <AlertCircle size={12} /> Powered by LayerZero Protocol
         </p>
      </div>
    </div>
  );
};

export default Bridge;