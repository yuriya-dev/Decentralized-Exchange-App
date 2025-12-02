import { ethers, BrowserProvider, Contract } from 'ethers';

// --- CONFIGURATION ---
export const NETWORKS = {
  SEPOLIA: {
    chainId: '0xaa36a7', // 11155111
    chainName: 'Sepolia Testnet',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  },
  POLYGON_AMOY: {
    chainId: '0x13882', // 80002
    chainName: 'Polygon Amoy',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://www.oklink.com/amoy']
  }
};

// FIX: Gunakan alamat lowercase agar Ethers v6 tidak komplain soal checksum
const ROUTER_ADDRESS = "0xc532a742dff90d0617d079d8f0ac87a685971596"; 

// Update ABI to standard Human-Readable format (removing 'calldata', 'memory', 'external' keywords for better compatibility)
const ROUTER_ABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline) payable returns (uint[] amounts)",
  "function getAmountsOut(uint amountIn, address[] path) view returns (uint[] amounts)",
  "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) payable returns (uint amountToken, uint amountETH, uint liquidity)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function transfer(address to, uint256 amount) returns (bool)" 
];

// FIX: Gunakan alamat lowercase untuk Token juga
export const TOKENS: Record<string, string> = {
    ETH: "NATIVE",
    USDC: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238", 
    WETH: "0xfff9976782d46cc05630d1f6ebab18b2324d6b14"
};

// --- CORE FUNCTIONS ---

export const connectWallet = async () => {
  // @ts-ignore
  if (!window.ethereum) throw new Error("Metamask not found");
  // @ts-ignore
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const { chainId } = await provider.getNetwork();
  
  const balance = await provider.getBalance(address);
  return { 
      address, 
      balance: ethers.formatEther(balance), 
      signer, 
      provider,
      chainId: Number(chainId)
  };
};

// Fungsi Ganti Network
export const switchNetwork = async (networkConfig: any) => {
    // @ts-ignore
    if (!window.ethereum) return;
    try {
        // @ts-ignore
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkConfig.chainId }],
        });
    } catch (switchError: any) {
        // Jika network belum ada, tambahkan
        if (switchError.code === 4902) {
            try {
                // @ts-ignore
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [networkConfig],
                });
            } catch (addError) {
                console.error(addError);
            }
        }
    }
};

// Fungsi Transfer Native (ETH/MATIC)
export const sendNativeToken = async (signer: any, to: string, amount: string) => {
    const tx = await signer.sendTransaction({
        to: to,
        value: ethers.parseEther(amount)
    });
    return tx.wait();
};

// Fungsi Transfer ERC20
export const sendERC20Token = async (signer: any, tokenAddress: string, to: string, amount: string) => {
    const contract = new Contract(tokenAddress, ERC20_ABI, signer);
    // Kita asumsikan token standar 18 decimals, idealnya fetch decimals dulu
    const decimals = await contract.decimals(); 
    const amountParsed = ethers.parseUnits(amount, decimals);
    const tx = await contract.transfer(to, amountParsed);
    return tx.wait();
};

export const executeSwapETHForToken = async (signer: any, tokenOutAddress: string, amountInEther: string) => {
    try {
        const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        
        const amountIn = ethers.parseEther(amountInEther);
        const path = [TOKENS.WETH, tokenOutAddress]; 
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; 

        try {
            await router.getAmountsOut(amountIn, path);
        } catch (error) {
            console.error("Liquidity Check Failed:", error);
            throw new Error("Liquidity Empty");
        }

        const tx = await router.swapExactETHForTokens(
            0, 
            path,
            await signer.getAddress(),
            deadline,
            { value: amountIn } 
        );
        
        return tx.wait();
    } catch (error: any) {
        if (error.reason) throw new Error(`Blockchain Error: ${error.reason}`);
        if (error.message.includes("insufficient funds")) throw new Error("Insufficient funds for gas + value");
        if (error.message === "Liquidity Empty") throw error;
        throw error;
    }
};

// --- FUNGSI ADD LIQUIDITY ---
export const addLiquidityETH = async (signer: any, tokenAddress: string, amountTokenDesired: string, amountETHDesired: string) => {
    try {
        const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);

        const decimals = await tokenContract.decimals();
        const amountToken = ethers.parseUnits(amountTokenDesired, decimals);
        const amountETH = ethers.parseEther(amountETHDesired);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

        // 1. Approve Router untuk menggunakan Token kita
        // Note: Pastikan user punya saldo token ini di walletnya!
        console.log("Approving token...");
        const approveTx = await tokenContract.approve(ROUTER_ADDRESS, amountToken);
        await approveTx.wait();
        console.log("Token Approved");

        // 2. Add Liquidity
        console.log("Adding liquidity...");
        const tx = await router.addLiquidityETH(
            tokenAddress,
            amountToken,
            0, // amountTokenMin (slippage tolerance, set 0 for dev)
            0, // amountETHMin
            await signer.getAddress(),
            deadline,
            { value: amountETH }
        );

        return tx.wait();
    } catch (error: any) {
        console.error("Add Liquidity Failed:", error);
        throw new Error(error.reason || error.message || "Add Liquidity Failed");
    }
};