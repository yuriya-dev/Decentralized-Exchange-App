import { ethers, BrowserProvider, Contract } from 'ethers';

// Uniswap V2 Router Address (Sepolia)
// Note: Likuiditas di testnet sering kosong. Jika swap gagal, kemungkinan besar karena tidak ada pair ETH/USDC di contract ini.
const ROUTER_ADDRESS = "0xC532a742dfF90d0617d079D8f0ac87a685971596"; 

// ABI Minimal
const ROUTER_ABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)"
];

// Address Token di Sepolia
export const TOKENS: Record<string, string> = {
    ETH: "NATIVE",
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Mock USDC
    WETH: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"  // WETH Sepolia
};

export const connectWallet = async () => {
  // @ts-ignore
  if (!window.ethereum) throw new Error("Metamask not found");
  // @ts-ignore
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const { chainId } = await provider.getNetwork();
  
  // Peringatan jika bukan Sepolia
  if (Number(chainId) !== 11155111) {
    console.warn("Not on Sepolia network");
  }

  const balance = await provider.getBalance(address);
  return { 
      address, 
      balance: ethers.formatEther(balance), 
      signer, 
      provider 
  };
};

export const executeSwapETHForToken = async (signer: any, tokenOutAddress: string, amountInEther: string) => {
    try {
        const router = new Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
        
        const amountIn = ethers.parseEther(amountInEther);
        const path = [TOKENS.WETH, tokenOutAddress]; // ETH -> WETH -> Token
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins

        // Cek Estimasi dulu (untuk memastikan pair ada likuiditasnya)
        try {
            await router.getAmountsOut(amountIn, path);
        } catch (error) {
            console.error("Liquidity Check Failed:", error);
            throw new Error("Insufficient Liquidity for this pair on Testnet");
        }

        // Execute Swap
        // Set amountOutMin ke 0 untuk demo (di production harus dihitung slippage)
        const tx = await router.swapExactETHForTokens(
            0, 
            path,
            await signer.getAddress(),
            deadline,
            { value: amountIn } // Kirim ETH
        );
        
        return tx.wait();
    } catch (error: any) {
        // Parsing error message yang lebih friendly
        if (error.reason) throw new Error(`Blockchain Error: ${error.reason}`);
        if (error.message.includes("insufficient funds")) throw new Error("Insufficient funds for gas + value");
        throw error;
    }
};