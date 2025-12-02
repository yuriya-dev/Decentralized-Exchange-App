import { Link, useLocation } from 'react-router-dom';
import { ArrowRightLeft, BarChart2, Wallet, Layers, X, PieChart, Activity } from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();

  const menu = [
    { name: 'Swap', icon: <ArrowRightLeft size={20} />, path: '/' },
    { name: 'Spot', icon: <BarChart2 size={20} />, path: '/spot' },
    { name: 'Margin', icon: <Layers size={20} />, path: '/margin' },
    { name: 'Earn', icon: <PieChart size={20} />, path: '/earn' },
    { name: 'Execution', icon: <Activity size={20} />, path: '/execution' },
    { name: 'Wallet', icon: <Wallet size={20} />, path: '/wallet' },
  ];

  return (
    <div className="h-full bg-light-card dark:bg-fintech-card/50 backdrop-blur-md border-r border-light-border dark:border-fintech-border p-6 flex flex-col transition-colors duration-300">
      
      {/* Header Sidebar */}
      <div className="flex items-center justify-between mb-10">
        <Link to="/" className="flex items-center gap-3 group">
          {/* Logo dengan Gradient */}
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center text-white font-bold shadow-neon group-hover:scale-110 transition-transform">
            D
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-primary-gradient dark:bg-gradient-to-r dark:from-white dark:to-gray-400">
            DexCore
          </h1>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1 text-light-muted hover:text-light-primary dark:text-fintech-muted dark:hover:text-fintech-primary">
          <X size={24} />
        </button>
      </div>
      
      {/* Menu Items */}
      <div className="space-y-2">
        {menu.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.name} 
              to={item.path}
              onClick={onClose}
              className={`
                flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all font-medium relative overflow-hidden group
                ${isActive 
                  ? 'bg-blue-50 dark:bg-fintech-primary/10 text-light-primary dark:text-fintech-primary' 
                  : 'text-light-muted dark:text-fintech-muted hover:bg-slate-50 dark:hover:bg-fintech-cardHover hover:text-light-text dark:hover:text-white'
                }
              `}
            >
              {/* Active Indicator Bar (Left Side) */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-light-primary dark:bg-fintech-primary rounded-r-full shadow-[0_0_10px_#06B6D4]"></div>
              )}
              
              <span className={`relative z-10 transition-transform ${isActive ? 'translate-x-2' : 'group-hover:translate-x-1'}`}>
                {item.icon}
              </span>
              <span className={`relative z-10 transition-transform ${isActive ? 'translate-x-2' : 'group-hover:translate-x-1'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Footer / User Info Placeholder */}
      <div className="mt-auto pt-6 border-t border-light-border dark:border-fintech-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-light-bg dark:bg-fintech-bg/50 border border-light-border dark:border-fintech-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500"></div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate dark:text-white">User123</p>
                  <p className="text-xs text-light-muted dark:text-fintech-muted truncate">Basic Plan</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Sidebar;