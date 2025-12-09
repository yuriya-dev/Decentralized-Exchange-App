import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Wallet, ChevronDown, Search, Globe, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useWeb3 } from '../context/Web3Context';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { account, connectWallet, disconnectWallet, isConnected, chainId } = useWeb3();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Menu Navigasi
  const menuItems = [
    { name: 'Swap', path: '/' },
    { name: 'Spot', path: '/spot' },
    { name: 'Earn', path: '/earn' },
    { name: 'Bridge', path: '/bridge' },
    { name: 'Wallet', path: '/wallet' },
  ];

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  return (
    <nav className="sticky top-0 z-50 border-b border-light-border dark:border-fintech-border bg-light-card/80 dark:bg-fintech-bg/80 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* --- LEFT: Logo & Links --- */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-primary-gradient flex items-center justify-center text-white font-bold shadow-neon group-hover:scale-110 transition-transform">
                DX
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-primary-gradient hidden sm:block">
                DecentraX
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'text-light-text dark:text-white bg-light-bg dark:bg-fintech-card' 
                        : 'text-light-muted dark:text-fintech-muted hover:text-light-primary dark:hover:text-fintech-primary hover:bg-light-bg/50 dark:hover:bg-fintech-card/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* --- MIDDLE: Search Bar (Desktop) --- */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-light-muted dark:text-fintech-muted group-focus-within:text-fintech-primary transition-colors"/>
              </div>
              <input 
                type="text"
                placeholder="Search tokens and pools..." 
                className="w-full bg-light-bg dark:bg-fintech-card border border-light-border dark:border-fintech-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-fintech-primary focus:ring-1 focus:ring-fintech-primary transition-all text-light-text dark:text-white placeholder-light-muted dark:placeholder-fintech-muted"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs text-light-muted dark:text-fintech-muted bg-light-card dark:bg-fintech-bg px-1.5 py-0.5 rounded border border-light-border dark:border-fintech-border">/</span>
              </div>
            </div>
          </div>

          {/* --- RIGHT: Tools (Wallet, Network, Theme) --- */}
          <div className="hidden md:flex items-center gap-3">
            {/* Network Selector (Static for demo) */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl bg-light-bg dark:bg-fintech-card border border-light-border dark:border-fintech-border text-sm font-medium text-light-text dark:text-white cursor-pointer hover:border-fintech-primary transition-colors">
               <Globe size={16} className="text-light-muted dark:text-fintech-muted"/>
               {chainId === 11155111 ? 'Sepolia' : chainId === 80002 ? 'Polygon Amoy' : 'Network'}
               <ChevronDown size={14} className="text-light-muted dark:text-fintech-muted"/>
            </div>

            {/* Wallet Button */}
            <button 
              onClick={isConnected ? disconnectWallet : connectWallet}
              className={`
                 group relative px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2
                 ${isConnected 
                     ? 'bg-light-bg dark:bg-fintech-card border border-light-border dark:border-fintech-border text-light-text dark:text-white hover:border-fintech-danger hover:text-fintech-danger' 
                     : 'bg-fintech-primary text-white hover:brightness-110 shadow-neon'
                 }
              `}
            >
               {isConnected && account ? (
                   <>
                     <div className="w-2 h-2 rounded-full bg-fintech-success group-hover:bg-fintech-danger"></div>
                     <span className="group-hover:hidden">{formatAddress(account)}</span>
                     <span className="hidden group-hover:inline">Disconnect</span>
                   </>
               ) : (
                   <>Connect</>
               )}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl hover:bg-light-bg dark:hover:bg-fintech-card text-light-muted dark:text-fintech-muted transition-colors"
            >
               {theme === 'dark' ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-slate-600"/>}
            </button>
          </div>

          {/* --- MOBILE: Menu Button --- */}
          <div className="md:hidden flex items-center">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-light-text dark:text-white">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-light-card dark:bg-fintech-bg border-b border-light-border dark:border-fintech-border absolute w-full px-4 py-4 space-y-4 shadow-xl animate-slide-in-top">
           {/* Links */}
           <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium ${
                    location.pathname === item.path 
                      ? 'bg-light-primary/10 dark:bg-fintech-primary/10 text-light-primary dark:text-fintech-primary' 
                      : 'text-light-muted dark:text-fintech-muted hover:bg-light-bg dark:hover:bg-fintech-card'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
           </div>

           <div className="h-px bg-light-border dark:bg-fintech-border my-2"></div>

           {/* Mobile Tools */}
           <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                 <span className="text-sm text-light-muted dark:text-fintech-muted">Theme</span>
                 <button onClick={toggleTheme} className="p-2 bg-light-bg dark:bg-fintech-card rounded-lg border border-light-border dark:border-fintech-border">
                    {theme === 'dark' ? <Sun size={18} className="text-yellow-400"/> : <Moon size={18} className="text-slate-600"/>}
                 </button>
              </div>
              
              <button 
                onClick={() => {
                    if (isConnected) disconnectWallet();
                    else connectWallet();
                    setIsMobileMenuOpen(false);
                }}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${isConnected ? 'bg-fintech-danger/10 text-fintech-danger border border-fintech-danger/30' : 'bg-fintech-primary text-white'}`}
              >
                 <Wallet size={18} />
                 {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
              </button>
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;