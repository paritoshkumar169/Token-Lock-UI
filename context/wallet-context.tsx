"use client"

import { useMemo, type ReactNode } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"

// Import the styles
import "@solana/wallet-adapter-react-ui/styles.css"

interface WalletContextProviderProps {
  children: ReactNode
}

export const WalletContextProvider = ({ children }: WalletContextProviderProps) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    // Use the provided Helius RPC URL if available
    if (process.env.NEXT_PUBLIC_RPC_ENDPOINT) {
      console.log("Using Helius RPC endpoint:", process.env.NEXT_PUBLIC_RPC_ENDPOINT)
      return process.env.NEXT_PUBLIC_RPC_ENDPOINT
    }

    // Fallback to the RPC_URL if available
    if (process.env.NEXT_PUBLIC_RPC_URL) {
      console.log("Using custom RPC URL:", process.env.NEXT_PUBLIC_RPC_URL)
      return process.env.NEXT_PUBLIC_RPC_URL
    }

    // Fallback to Solana's public RPC endpoint
    const url = clusterApiUrl(network)
    console.log("Using default Solana RPC URL:", url)
    return url
  }, [network])

  // Only include wallets that don't require the mobile adapter
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
