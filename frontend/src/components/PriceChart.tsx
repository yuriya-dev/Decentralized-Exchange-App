import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { fetchChartData } from '../lib/api';
import type { ChartDataPoint } from '../lib/api';
import { Loader2 } from 'lucide-react';
import Skeleton from './Skeleton';

// Interface Props Updated
interface PriceChartProps {
  symbol?: string; 
  price?: number; // Tambahan: Harga saat ini dari parent
  change?: number; // Tambahan: Perubahan 24h dari parent
}

const PriceChart = ({ symbol = 'BTC', price, change }: PriceChartProps) => {
  const { theme } = useTheme();
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState('1D');
  
  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        setError(false);
        try {
            const chartData = await fetchChartData(symbol, range);
            if (chartData && chartData.length > 0) {
              setData(chartData);
            } else {
              throw new Error("Empty data");
            }
        } catch (error) {
            console.error("Failed to fetch chart data", error);
            setError(true);
            const mockData = generateMockData(range);
            setData(mockData);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [range, symbol]); 
  
  const chartColor = theme === 'dark' ? '#06B6D4' : '#0284C7'; 

  const generateMockData = (rng: string) => {
     const points = rng === '1W' ? 7 : rng === '1M' ? 30 : 24;
     const base = 42000;
     return Array.from({ length: points }).map((_, i) => ({
         name: i.toString(),
         price: base + Math.random() * 1000
     }));
  };

  // Logika Penentuan Harga Display
  // Prioritas 1: Props 'price' (dari Dashboard/API List Token) - Paling Akurat
  // Prioritas 2: Data terakhir dari chart history
  const displayPrice = price !== undefined 
    ? price 
    : (data.length > 0 ? data[data.length-1].price : 0);

  // Logika Penentuan Change %
  // Prioritas 1: Props 'change' (dari Dashboard)
  // Prioritas 2: Hitung manual dari awal vs akhir chart
  const displayChange = change !== undefined 
    ? change 
    : (data.length > 1 ? ((data[data.length-1].price - data[0].price) / data[0].price) * 100 : 0);

  const isPositive = displayChange >= 0;

  if (loading) {
      return (
        <div className="flex flex-col h-full w-full p-4 space-y-6">
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-24 h-6" />
                        <Skeleton className="w-16 h-5" />
                    </div>
                    <Skeleton className="w-48 h-10" />
                </div>
                <Skeleton className="w-48 h-8 rounded-xl" />
            </div>
            <div className="flex-1 w-full bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse relative overflow-hidden">
                <svg className="absolute bottom-0 left-0 right-0 w-full h-1/3 text-gray-200 dark:text-white/5" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 20 L0 10 Q 25 20 50 10 T 100 10 L 100 20 Z" fill="currentColor"/>
                </svg>
            </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full w-full p-3 sm:p-4">
       {/* Header Controls */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <div>
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-fintech-primary/20 flex items-center justify-center text-fintech-primary font-bold border border-fintech-primary/30">
                    {symbol[0]}
                </div>
                <h3 className="text-lg sm:text-xl font-bold dark:text-white">{symbol}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-light-border dark:bg-fintech-border text-light-muted dark:text-fintech-muted font-mono">{symbol}/USD</span>
             </div>
             <div className="flex items-baseline gap-2 sm:gap-3 mt-1">
                 <h2 className="text-3xl sm:text-4xl font-bold dark:text-white transition-all duration-300">
                    ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} 
                 </h2>
                 <span className={`text-base sm:text-lg font-medium ${isPositive ? 'text-fintech-success' : 'text-fintech-danger'} flex items-center gap-1`}>
                    {isPositive ? '+' : ''}{displayChange.toFixed(2)}%
                    {error && <span className="text-xs bg-red-500/10 text-red-500 px-1 rounded ml-2" title="Offline Mode">Offline</span>}
                 </span>
             </div>
          </div>
          
          <div className="flex w-full sm:w-auto bg-light-bg dark:bg-fintech-bg/50 rounded-xl p-1 border border-light-border dark:border-fintech-border/50 overflow-x-auto">
              {['1D', '1W', '1M', '1Y'].map((t) => (
                  <button 
                    key={t} 
                    onClick={() => setRange(t)}
                    className={`
                        flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap
                        ${range === t 
                            ? 'bg-white dark:bg-fintech-card shadow-sm text-light-primary dark:text-fintech-primary scale-105' 
                            : 'text-light-muted dark:text-fintech-muted hover:text-light-text dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                        }
                    `}
                  >
                    {t}
                  </button>
              ))}
          </div>
       </div>

       {/* Chart Area */}
       <div className="flex-1 w-full min-h-[250px] sm:min-h-[300px] relative rounded-2xl overflow-hidden border border-transparent dark:border-white/5 bg-gradient-to-b from-transparent to-light-bg/50 dark:to-fintech-bg/30">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
                        border: theme === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(8px)',
                        fontSize: '12px'
                    }}
                    labelStyle={{ color: theme === 'dark' ? '#94A3B8' : '#64748B', marginBottom: '0.25rem', fontSize: '11px' }}
                    itemStyle={{ color: theme === 'dark' ? '#fff' : '#0F172A', fontWeight: 'bold', fontSize: '13px' }}
                    formatter={(value: number) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 'Price']}
                />
                <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={chartColor} 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    animationDuration={1500}
                />
                </AreaChart>
            </ResponsiveContainer>
       </div>
    </div>
  );
};

export default PriceChart;