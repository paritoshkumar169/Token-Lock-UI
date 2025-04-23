"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import type { TokenInfo } from "@/types"
import { ChevronDown } from "lucide-react"

interface TokenSelectorProps {
  onSelect: (token: TokenInfo) => void
  selectedToken: TokenInfo | null
}

export const TokenSelector = ({ onSelect, selectedToken }: TokenSelectorProps) => {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Mock tokens for demo purposes
  useEffect(() => {
    if (publicKey) {
      // In a real app, you would fetch the user's tokens from the blockchain
      const mockTokens: TokenInfo[] = [
        {
          mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
          symbol: "USDC",
          name: "USD Coin",
          decimals: 6,
          balance: 1000,
        },
        {
          mint: new PublicKey("So11111111111111111111111111111111111111112"),
          symbol: "SOL",
          name: "Solana",
          decimals: 9,
          balance: 5,
        },
        {
          mint: new PublicKey("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"),
          symbol: "GIGA",
          name: "GIGACHAD",
          decimals: 6,
          balance: 420,
        },
      ]
      setTokens(mockTokens)
    }
  }, [publicKey, connection])

  const handleSelect = (token: TokenInfo) => {
    onSelect(token)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full">
      <button
        type="button"
        className="flex items-center justify-between w-full p-3 bg-input text-foreground rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedToken ? (
          <div className="flex items-center">
            {selectedToken.icon ? (
              <img
                src={selectedToken.icon || "/placeholder.svg"}
                alt={selectedToken.symbol}
                className="w-6 h-6 mr-2 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 mr-2 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                {selectedToken.symbol.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold">{selectedToken.symbol}</div>
              <div className="text-sm text-gray-400">{selectedToken.name}</div>
            </div>
          </div>
        ) : (
          <span>Select Token</span>
        )}
        <ChevronDown className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-card rounded-lg shadow-lg max-h-60 overflow-auto">
          {tokens.map((token) => (
            <div
              key={token.mint.toString()}
              className="flex items-center p-3 hover:bg-input cursor-pointer"
              onClick={() => handleSelect(token)}
            >
              {token.icon ? (
                <img src={token.icon || "/placeholder.svg"} alt={token.symbol} className="w-6 h-6 mr-2 rounded-full" />
              ) : (
                <div className="w-6 h-6 mr-2 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                  {token.symbol.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-bold">{token.symbol}</div>
                <div className="text-sm text-gray-400">{token.name}</div>
              </div>
              <div className="ml-auto text-sm">
                {token.balance?.toLocaleString()} {token.symbol}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
