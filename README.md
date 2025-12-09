🚀 DecentraX DEX

DecentraX DEX adalah platform pertukaran terdesentralisasi (Decentralized Exchange) modern yang dibangun dengan antarmuka premium, mendukung mode gelap/terang, dan data pasar real-time. Proyek ini menghubungkan pengalaman pengguna (UX) web tradisional dengan fungsionalitas Web3.

<!-- Ganti dengan screenshot aplikasi Anda nanti -->

✨ Fitur Saat Ini (Current Features)

1. 💱 Instant Swap Engine

Token Selector Dinamis: Memilih token dari daftar top 100 cryptocurrency (diambil dari CoinGecko).

Smart Calculation: Menghitung estimasi output, price impact, dan fee secara otomatis.

Dual Mode:

Simulasi: Menghitung hasil swap menggunakan harga pasar real-time tanpa gas fee.

On-Chain Swap: Eksekusi transaksi nyata di jaringan Ethereum Sepolia Testnet menggunakan Smart Contract Uniswap V2.

Advanced Settings: Pengaturan toleransi Slippage dan Deadline transaksi.

2. 📊 Dashboard & Market Data

Real-time Prices: Menggunakan Backend Proxy untuk mengambil harga langsung dari CoinGecko API (menghindari rate limit di frontend).

Interactive Chart: Grafik harga historis (1D, 1W, 1M, 1Y) yang responsif terhadap aset yang dipilih.

Market Overview: Tabel aset teratas dengan filter (All, Top Gainers, Top Losers) dan indikator tren visual.

Trending Widget: Menampilkan aset yang sedang tren atau mengalami kenaikan tertinggi.

3. 👛 Wallet Integration

Metamask Support: Koneksi mulus dengan wallet Web3.

Balance Detection: Mendeteksi saldo ETH pengguna secara otomatis.

Network Guard: Validasi jaringan otomatis (memastikan pengguna berada di Sepolia Testnet).

4. 🎨 UI/UX Premium

Dual Theme: Dukungan penuh untuk Dark Mode (Fintech Navy Style) dan Light Mode (Clean Corporate).

Responsive Design: Tampilan optimal di Desktop, Tablet, dan Mobile.

Interactive Feedback: Notifikasi Toast kustom (bukan alert browser standar) dan Loading Skeleton untuk pengalaman yang mulus.

🛠️ Tech Stack

Frontend:

React + TypeScript + Vite

TailwindCSS (Styling & Theming)

Ethers.js v6 (Blockchain Interaction)

Recharts (Data Visualization)

Lucide React (Icons)

Backend:

Node.js + Express

Axios (HTTP Client)

CoinGecko API (Market Data Source)

🗺️ Roadmap: Next Features

Kami berencana memperluas platform ini menjadi ekosistem DeFi lengkap. Berikut adalah fitur yang sedang dalam pengembangan:

📈 Spot Trading (Order Book)

Implementasi grafik Candlestick advanced (TradingView integration).

Tampilan Order Book (Buy/Sell walls).

Fitur Limit Order (Beli/Jual di harga tertentu).

💸 Margin Trading

Fitur Leverage Trading (Long/Short) hingga 5x-10x.

Manajemen kolateral dan likuidasi.

Indikator posisi (PnL real-time).

🌾 Earn & Staking

Liquidity Provision: Menambahkan likuiditas ke pool untuk mendapatkan fee.

Staking: Mengunci token (ETH/USDC) untuk mendapatkan reward APY tahunan.

Yield Farming Dashboard.

⚡ Execution & History

Halaman riwayat transaksi lengkap (Swap, Approve, Transfer).

Status tracker transaksi on-chain (Pending, Success, Failed).

Ekspor riwayat transaksi ke CSV untuk keperluan pajak/audit.

💼 Enhanced Wallet Management

Visualisasi portofolio aset pengguna (Pie chart alokasi aset).

Fitur Send/Receive token langsung dari antarmuka.

Dukungan multi-chain (Switch ke Polygon/BSC/Arbitrum).

🚀 Cara Menjalankan Proyek (Local Development)

Ikuti langkah ini untuk menjalankan proyek di komputer Anda.

Prasyarat

Node.js (v16+)

NPM / Yarn

API Key CoinGecko (Demo/Free account)

1. Setup Backend

cd backend
npm install

# Buat file .env
echo "COINGECKO_API_KEY=CG-XXXXXXXXX" > .env

# Jalankan Server
npm run dev


Backend akan berjalan di http://localhost:5000

2. Setup Frontend

cd frontend
npm install

# Jalankan Client
npm run dev


Frontend akan berjalan di http://localhost:5173

⚠️ Catatan Penting

Proyek ini saat ini dikonfigurasi untuk berjalan di Sepolia Testnet. Pastikan wallet Metamask Anda memiliki Sepolia ETH (bisa didapatkan dari Faucet) untuk mencoba fitur swap on-chain.