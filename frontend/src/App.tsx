import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Web3Provider } from './context/Web3Context';
import { ToastProvider } from './context/ToastContext'; // Import ToastProvider
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-fade-in">
    <div className="text-6xl">🚧</div>
    <h2 className="text-2xl font-bold text-light-text dark:text-white">{title} Page</h2>
    <p className="text-light-muted dark:text-fintech-muted">This feature is coming soon in V3.14.3</p>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider> {/* Wrap ToastProvider paling luar atau di dalam Theme */}
        <Web3Provider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/swap" element={<Dashboard />} />
                <Route path="/spot" element={<PlaceholderPage title="Spot Trading" />} />
                <Route path="/margin" element={<PlaceholderPage title="Margin Trading" />} />
                <Route path="/wallet" element={<PlaceholderPage title="Wallet" />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </Web3Provider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;