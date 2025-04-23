"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { ChevronDown } from "lucide-react"

export const WalletConnectButton = () => {
  const { connected, publicKey } = useWallet()

  return (
    <div className="relative">
      {connected ? (
        <div className="flex items-center justify-center px-4 py-2 rounded-lg bg-card text-foreground hover:opacity-90 transition-opacity">
          <WalletMultiButton className="!bg-transparent !hover:bg-transparent !border-0 !text-foreground !h-auto !p-0" />
          <ChevronDown className="ml-2 h-4 w-4" />
        </div>
      ) : (
        <WalletMultiButton className="!bg-primary !text-primary-foreground !rounded-lg !font-medium !px-6 !py-2 !h-auto" />
      )}
    </div>
  )
}
