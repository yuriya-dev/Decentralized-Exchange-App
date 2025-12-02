import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ethers, BrowserProvider, formatEther } from 'ethers';

interface Web3ContextType {
  account: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fungsi internal untuk update state dari provider
  const updateAccountState = async (provider: BrowserProvider, address: string) => {
    const bal = await provider.getBalance(address);
    const network = await provider.getNetwork();
    
    setAccount(address);
    setBalance(formatEther(bal));
    setChainId(Number(network.chainId));
    setIsConnected(true);
  };

  const connectWallet = async () => {
    // @ts-ignore
    if (typeof window.ethereum !== 'undefined') {
      try {
        // @ts-ignore
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        
        if (accounts.length > 0) {
          await updateAccountState(provider, accounts[0]);
        }
      } catch (error) {
        console.error("User rejected connection", error);
        alert("Connection failed!");
      }
    } else {
      alert("Metamask is not installed!");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0");
    setIsConnected(false);
  };

  // Auto-connect & Event Listeners
  useEffect(() => {
    // @ts-ignore
    if (typeof window.ethereum !== 'undefined') {
      // @ts-ignore
      const provider = new BrowserProvider(window.ethereum);

      // Cek jika sudah connect sebelumnya
      provider.listAccounts().then(async (accounts) => {
        if (accounts.length > 0) {
          await updateAccountState(provider, accounts[0].address);
        }
      });

      // Listen perubahan akun (ganti wallet di metamask)
      // @ts-ignore
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          await updateAccountState(provider, accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      // Listen perubahan network
      // @ts-ignore
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, balance, chainId, isConnected, connectWallet, disconnectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};