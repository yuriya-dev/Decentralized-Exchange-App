import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ArrowDown, Settings, Info, Loader2, Wallet, AlertCircle, ChevronDown, X, Search, Clock } from 'lucide-react';
import { executeSwapETHForToken, TOKENS } from '../lib/web3';
import { fetchSimulatedSwap, fetchTokens } from '../lib/api';
import { useWeb3 } from '../context/Web3Context';
import { useToast } from '../context/ToastContext';

// Interface untuk Token
interface TokenData {
  symbol: string;
  name: string;
  logo: string;
  price?: number;
}

// Interface Props
interface SwapCardProps {
  onTokenChange?: (symbol: string) => void;
}

const SwapCard = ({ onTokenChange }: SwapCardProps) => {
  const { account, balance, isConnected, connectWallet } = useWeb3();
  const { addToast } = useToast();
  
  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState<number>(0);
  
  const [availableTokens, setAvailableTokens] = useState<TokenData[]>([]);
  const [tokenIn, setTokenIn] = useState<TokenData | null>(null);
  const [tokenOut, setTokenOut] = useState<TokenData | null>(null);
  
  // State Modal Selection & Settings
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [selectingSide, setSelectingSide] = useState<'in' | 'out'>('in');
  const [searchQuery, setSearchQuery] = useState("");

  // Swap Settings State
  const [slippage, setSlippage] = useState<number>(0.5); 
  const [deadline, setDeadline] = useState<number>(20); 

  // State Saldo Token yang Dipilih
  const [tokenBalance, setTokenBalance] = useState<string>("0");

  useEffect(() => {
    const loadTokens = async () => {
      try {
        const tokens = await fetchTokens();
        if (tokens && tokens.length > 0) {
          setAvailableTokens(tokens);
          const eth = tokens.find((t: any) => t.symbol === 'ETH') || tokens[0];
          const usdc = tokens.find((t: any) => t.symbol === 'USDC') || tokens[1] || tokens[0];
          
          setTokenIn(eth);
          setTokenOut(usdc);
        }
      } catch (error) {
        console.error("Failed to load tokens", error);
      }
    };
    loadTokens();
  }, []);

  // Effect untuk Update Balance Asli dari Blockchain
  useEffect(() => {
    const fetchTokenBalance = async () => {
        if (!isConnected || !account || !tokenIn) {
            setTokenBalance("0");
            return;
        }

        try {
            if (tokenIn.symbol === 'ETH') {
                // Gunakan saldo Native ETH dari Context
                setTokenBalance(balance); 
            } else {
                // Cek apakah kita punya address kontrak untuk token ini di testnet (mapping dari web3.ts)
                const tokenAddress = TOKENS[tokenIn.symbol];

                if (tokenAddress) {
                    // Fetch Real Balance Token dari Blockchain
                    // @ts-ignore
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    
                    // ABI Minimal untuk cek saldo ERC20
                    const erc20Abi = [
                        "function balanceOf(address owner) view returns (uint256)",
                        "function decimals() view returns (uint8)"
                    ];
                    
                    const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
                    
                    try {
                        const rawBalance = await contract.balanceOf(account);
                        const decimals = await contract.decimals();
                        const formattedBalance = ethers.formatUnits(rawBalance, decimals);
                        setTokenBalance(formattedBalance);
                    } catch (err) {
                        console.error("Error reading contract:", err);
                        setTokenBalance("0");
                    }
                } else {
                    // Jika token tidak terdaftar di config TOKENS kita (karena ini testnet terbatas), saldo 0
                    setTokenBalance("0");
                }
            }
        } catch (err) {
            console.error("Error fetching token balance:", err);
            setTokenBalance("0");
        }
    };

    fetchTokenBalance();
  }, [tokenIn, balance, isConnected, account]);

  useEffect(() => {
    const timer = setTimeout(async () => {
        const val = parseFloat(amountIn);
        if (val > 0 && tokenIn && tokenOut) {
            try {
                const res = await fetchSimulatedSwap(tokenIn.symbol, tokenOut.symbol, val);
                setAmountOut(res.output);
                setPriceImpact(res.priceImpact);
            } catch(e) {
                console.error("Sim error", e);
            }
        } else {
            setAmountOut(0);
        }
    }, 600);
    return () => clearTimeout(timer);
  }, [amountIn, tokenIn, tokenOut]);

  const handleMax = () => {
      if (!isConnected || !tokenIn) return;
      
      const bal = parseFloat(tokenBalance); 
      
      // Sisakan 0.01 ETH untuk gas jika tokennya ETH
      const safeMax = tokenIn.symbol === 'ETH' ? Math.max(0, bal - 0.01) : bal;
      
      setAmountIn(safeMax.toString());
  };

  const handleSwitchTokens = () => {
      if (!tokenIn || !tokenOut) return;
      const tempToken = tokenIn;
      setTokenIn(tokenOut);
      setTokenOut(tempToken);
      setAmountIn("");
      setAmountOut(0);
      
      if (onTokenChange) onTokenChange(tokenOut.symbol);
  };

  const openTokenModal = (side: 'in' | 'out') => {
      setSelectingSide(side);
      setSearchQuery("");
      setIsModalOpen(true);
  };

  const handleSelectToken = (token: TokenData) => {
      if (!tokenIn || !tokenOut) return;

      if (selectingSide === 'in') {
          if (token.symbol === tokenOut.symbol) {
              setTokenOut(tokenIn);
          }
          setTokenIn(token);
          if (onTokenChange) onTokenChange(token.symbol);
      } else {
          if (token.symbol === tokenIn.symbol) {
              setTokenIn(tokenOut);
              if (onTokenChange) onTokenChange(tokenOut.symbol);
          }
          setTokenOut(token);
          if (onTokenChange && selectingSide === 'out') onTokenChange(token.symbol);
      }
      setIsModalOpen(false);
  };

  const handleSwap = async () => {
    if (!isConnected) {
      addToast("Please connect your wallet first", "info");
      return connectWallet();
    }
    
    setLoading(true);
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      try {
          const tx = await executeSwapETHForToken(signer, TOKENS.USDC, amountIn); 
          addToast(`Swap Submitted! Hash: ${tx.hash.substring(0, 10)}...`, "success");
      } catch (chainError: any) {
          console.error(chainError);
          if (chainError.message.includes("Liquidity")) {
             addToast(`Testnet Liquidity Empty. Swap settings: ${slippage}% slippage, ${deadline}m deadline.`, "info");
          } else {
             throw chainError;
          }
      }

      setAmountIn("");
      setAmountOut(0);
    } catch (error: any) {
      console.error(error);
      addToast(error.message || "Swap Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens = availableTokens.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!tokenIn || !tokenOut) {
      return (
        <div className="glass-panel p-6 w-full flex justify-center items-center h-[400px]">
            <Loader2 className="animate-spin text-fintech-primary" size={32} />
        </div>
      );
  }

  return (
    <div className="glass-panel p-6 w-full relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-fintech-primary/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-xl font-bold dark:text-white">Swap</h2>
        <div 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-light-bg dark:hover:bg-fintech-cardHover transition-colors cursor-pointer group"
        >
            <Settings className="text-light-muted dark:text-fintech-muted group-hover:text-fintech-primary group-hover:rotate-45 transition-all duration-300" size={20} />
        </div>
      </div>

      {/* Input Field (You Pay) */}
      <div className="bg-light-bg dark:bg-fintech-bg border border-light-border dark:border-fintech-border rounded-2xl p-4 mb-2 relative group focus-within:border-light-primary dark:focus-within:border-fintech-primary transition-all">
        <div className="flex justify-between text-light-muted dark:text-fintech-muted text-sm mb-2">
          <span>You Pay</span>
          <div className="flex items-center gap-2">
             <span className="flex items-center gap-1">
                <Wallet size={12}/> 
                {/* Menampilkan saldo token yang dipilih */}
                {isConnected ? parseFloat(tokenBalance).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0.00'}
             </span>
             {isConnected && (
                 <button 
                    onClick={handleMax}
                    className="text-xs bg-light-primary/10 dark:bg-fintech-primary/10 text-light-primary dark:text-fintech-primary px-2 py-0.5 rounded hover:bg-light-primary/20 transition"
                 >
                    MAX
                 </button>
             )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <input 
            type="number" 
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="bg-transparent text-3xl font-bold outline-none w-full text-light-text dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
          />
          <button 
            onClick={() => openTokenModal('in')}
            className="flex items-center gap-2 bg-light-card dark:bg-fintech-card px-3 py-2 rounded-xl border border-light-border dark:border-fintech-border shadow-sm hover:scale-105 transition min-w-[110px]"
          >
            <img src={tokenIn.logo} className="w-6 h-6 rounded-full" alt={tokenIn.symbol}/>
            <span className="font-bold text-lg dark:text-white">{tokenIn.symbol}</span>
            <ChevronDown size={16} className="text-gray-400 ml-auto"/>
          </button>
        </div>
      </div>

      {/* Warning Insufficient Balance */}
      {isConnected && parseFloat(amountIn) > parseFloat(tokenBalance) && (
          <div className="flex items-center gap-2 text-fintech-danger text-xs mb-2 px-2 animate-pulse">
              <AlertCircle size={12}/> Insufficient {tokenIn.symbol} balance
          </div>
      )}

      {/* Switch Button */}
      <div className="flex justify-center -my-5 relative z-20">
        <button 
            onClick={handleSwitchTokens}
            className="bg-light-card dark:bg-fintech-card p-2 rounded-xl border-4 border-light-card dark:border-fintech-card shadow-lg cursor-pointer hover:scale-110 transition-transform hover:rotate-180 duration-300 group"
        >
          <ArrowDown size={18} className="text-light-primary dark:text-fintech-primary group-hover:text-fintech-accent" />
        </button>
      </div>

      {/* Output Field (You Receive) */}
      <div className="bg-light-bg dark:bg-fintech-bg border border-light-border dark:border-fintech-border rounded-2xl p-4 mt-2 mb-6">
        <div className="text-light-muted dark:text-fintech-muted text-sm mb-2">You Receive</div>
        <div className="flex justify-between items-center">
          <input 
            type="number" 
            value={amountOut > 0 ? amountOut.toFixed(6) : ""}
            disabled 
            placeholder="0.0"
            className="bg-transparent text-3xl font-bold outline-none w-full text-light-muted dark:text-gray-400"
          />
          <button 
            onClick={() => openTokenModal('out')}
            className="flex items-center gap-2 bg-light-card dark:bg-fintech-card px-3 py-2 rounded-xl border border-light-border dark:border-fintech-border shadow-sm hover:scale-105 transition min-w-[110px]"
          >
            <img src={tokenOut.logo} className="w-6 h-6 rounded-full" alt={tokenOut.symbol}/>
            <span className="font-bold text-lg dark:text-white">{tokenOut.symbol}</span>
            <ChevronDown size={16} className="text-gray-400 ml-auto"/>
          </button>
        </div>
      </div>

      {/* Info Details */}
      {amountOut > 0 && (
        <div className="space-y-3 text-sm text-light-muted dark:text-fintech-muted mb-6 bg-light-bg/50 dark:bg-fintech-bg/50 p-4 rounded-xl border border-light-border dark:border-fintech-border/50">
            <div className="flex justify-between">
                <span>Rate</span>
                <span className="font-medium dark:text-gray-300">1 {tokenIn.symbol} ≈ {(amountOut/parseFloat(amountIn)).toFixed(4)} {tokenOut.symbol}</span>
            </div>
            <div className="flex justify-between">
                <div className="flex items-center gap-1">Price Impact <Info size={12}/></div>
                <span className={`font-medium ${priceImpact > 5 ? 'text-fintech-danger' : 'text-fintech-success'}`}>
                    {priceImpact.toFixed(2)}%
                </span>
            </div>
            <div className="flex justify-between">
                <div className="flex items-center gap-1">Slippage Tolerance <Settings size={12}/></div>
                <span className="font-medium dark:text-white">{slippage}%</span>
            </div>
            <div className="flex justify-between">
                <span>Network Fee</span>
                <span className="flex items-center gap-1">⛽ $5.00</span>
            </div>
        </div>
      )}

      {/* CTA Button */}
      <button 
        onClick={handleSwap} 
        disabled={loading || (isConnected && parseFloat(amountIn) > parseFloat(tokenBalance))}
        className={`w-full btn-primary flex justify-center items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
            <><Loader2 className="animate-spin" size={24}/> Processing...</>
        ) : (
            !isConnected ? "Connect Wallet" : 
            (parseFloat(amountIn) > parseFloat(tokenBalance) ? `Insufficient ${tokenIn.symbol}` : "Swap Now")
        )}
      </button>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-50 bg-light-card dark:bg-fintech-card animate-fade-in flex flex-col p-6 rounded-2xl">
             <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-lg dark:text-white">Transaction Settings</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-light-bg dark:hover:bg-fintech-bg rounded-lg transition-colors">
                    <X size={24} className="text-light-muted dark:text-fintech-muted"/>
                </button>
             </div>

             {/* Slippage Settings */}
             <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="font-semibold text-light-text dark:text-white">Slippage Tolerance</span>
                    <div className="group relative">
                        <Info size={14} className="text-light-muted dark:text-fintech-muted cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-black text-white text-xs rounded hidden group-hover:block">
                            Your transaction will revert if the price changes unfavorably by more than this percentage.
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {[0.1, 0.5, 1.0].map((val) => (
                        <button 
                            key={val}
                            onClick={() => setSlippage(val)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${slippage === val ? 'bg-fintech-primary text-white shadow-neon' : 'bg-light-bg dark:bg-fintech-bg text-light-muted dark:text-fintech-muted hover:bg-light-primary/10 dark:hover:bg-fintech-primary/10'}`}
                        >
                            {val}%
                        </button>
                    ))}
                    <div className={`flex-1 bg-light-bg dark:bg-fintech-bg rounded-xl px-3 py-2 flex items-center border ${slippage !== 0.1 && slippage !== 0.5 && slippage !== 1.0 ? 'border-fintech-primary' : 'border-transparent'}`}>
                        <input 
                            type="number" 
                            placeholder="Custom" 
                            value={slippage}
                            onChange={(e) => setSlippage(parseFloat(e.target.value))}
                            className="bg-transparent w-full outline-none text-right text-sm dark:text-white placeholder-gray-500"
                        />
                        <span className="text-sm text-light-muted dark:text-fintech-muted ml-1">%</span>
                    </div>
                </div>
             </div>

             {/* Deadline Settings */}
             <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="font-semibold text-light-text dark:text-white">Transaction Deadline</span>
                    <Clock size={14} className="text-light-muted dark:text-fintech-muted" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-24 bg-light-bg dark:bg-fintech-bg rounded-xl px-3 py-2 flex items-center border border-light-border dark:border-fintech-border focus-within:border-fintech-primary transition-colors">
                        <input 
                            type="number" 
                            value={deadline}
                            onChange={(e) => setDeadline(parseFloat(e.target.value))}
                            className="bg-transparent w-full outline-none text-right text-sm dark:text-white"
                        />
                    </div>
                    <span className="text-sm text-light-muted dark:text-fintech-muted">minutes</span>
                </div>
             </div>
             
             <button onClick={() => setIsSettingsOpen(false)} className="mt-auto w-full btn-primary py-3 rounded-xl">
                Save Settings
             </button>
        </div>
      )}

      {/* Token Selection Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-light-card dark:bg-fintech-card animate-fade-in flex flex-col">
            <div className="p-4 border-b border-light-border dark:border-fintech-border flex justify-between items-center">
                <h3 className="font-bold text-lg dark:text-white">Select Token</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-light-bg dark:hover:bg-fintech-bg rounded-lg">
                    <X size={24} className="text-light-muted dark:text-fintech-muted"/>
                </button>
            </div>
            
            <div className="p-4">
                <div className="flex items-center bg-light-bg dark:bg-fintech-bg border border-light-border dark:border-fintech-border rounded-xl px-3 py-2 focus-within:border-fintech-primary transition-colors">
                    <Search size={18} className="text-light-muted dark:text-fintech-muted mr-2"/>
                    <input 
                        type="text" 
                        placeholder="Search name or paste address" 
                        className="bg-transparent outline-none w-full text-light-text dark:text-white placeholder-light-muted dark:placeholder-fintech-muted"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredTokens.map((token) => (
                    <div 
                        key={token.symbol}
                        onClick={() => handleSelectToken(token)}
                        className={`
                            flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors
                            ${(selectingSide === 'in' ? tokenIn.symbol : tokenOut.symbol) === token.symbol 
                                ? 'bg-light-primary/10 dark:bg-fintech-primary/10 opacity-50 cursor-default' 
                                : 'hover:bg-light-bg dark:hover:bg-fintech-cardHover'
                            }
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <img src={token.logo} className="w-8 h-8 rounded-full" alt={token.symbol}/>
                            <div>
                                <div className="font-bold dark:text-white">{token.symbol}</div>
                                <div className="text-xs text-light-muted dark:text-fintech-muted">{token.name}</div>
                            </div>
                        </div>
                        {(selectingSide === 'in' ? tokenIn.symbol : tokenOut.symbol) === token.symbol && (
                            <div className="w-2 h-2 rounded-full bg-fintech-success"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default SwapCard;