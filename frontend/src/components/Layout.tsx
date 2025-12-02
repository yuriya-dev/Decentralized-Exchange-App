import { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Menu, Moon, Sun, Wallet, ChevronDown, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useWeb3 } from '../context/Web3Context'; // Gunakan Context

export const Layout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  // Ambil state dari Web3Context
  const { account, connectWallet, disconnectWallet, isConnected } = useWeb3();

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  return (
    <div className="min-h-screen flex relative overflow-x-hidden transition-colors duration-300">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-light-bg dark:bg-fintech-bg dark:bg-fintech-mesh transition-colors duration-300">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 glass-panel m-4 mb-0 sticky top-2 z-10 border-light-border dark:border-fintech-border">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg text-light-text dark:text-white">
            <Menu className="w-6 h-6" />
          </button>
          
          <span className="font-bold text-lg bg-clip-text text-transparent bg-primary-gradient">
            DexCore
          </span>

          <div className="flex gap-2">
            <button 
                onClick={isConnected ? disconnectWallet : connectWallet}
                className={`p-2 rounded-lg transition-all flex items-center justify-center ${isConnected ? 'bg-fintech-success/10 text-fintech-success' : 'bg-light-bg dark:bg-fintech-bg text-light-primary dark:text-fintech-primary border border-light-border dark:border-fintech-border'}`}
            >
                <Wallet size={20} />
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-lg">
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <div className="hidden lg:flex justify-end items-center p-6 pb-0 gap-4">
           {/* Wallet Button */}
           <button 
             onClick={isConnected ? disconnectWallet : connectWallet}
             className={`
                group relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg flex items-center gap-2
                ${isConnected 
                    ? 'bg-fintech-card border border-fintech-success/30 text-fintech-success hover:bg-fintech-danger/10 hover:text-fintech-danger hover:border-fintech-danger/30' 
                    : 'bg-primary-gradient text-white hover:brightness-110 shadow-neon'
                }
             `}
           >
              {isConnected && account ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-fintech-success animate-pulse group-hover:bg-fintech-danger"></div>
                    <span className="group-hover:hidden">{formatAddress(account)}</span>
                    <span className="hidden group-hover:inline">Disconnect</span>
                    <ChevronDown size={14} className="opacity-50 group-hover:hidden"/>
                    <LogOut size={14} className="hidden group-hover:block"/>
                  </>
              ) : (
                  <>
                    <Wallet size={18} />
                    <span>Connect Wallet</span>
                  </>
              )}
           </button>

           <button 
             onClick={toggleTheme} 
             className="glass-panel p-2.5 hover:scale-105 transition-transform flex items-center justify-center text-light-muted dark:text-fintech-muted hover:text-light-text dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-slate-600"/>}
           </button>
        </div>

        <main className="p-4 lg:p-8 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};