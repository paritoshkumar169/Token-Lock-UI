"use client"

import { useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { AnchorProvider } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { TokenLockForm } from "@/components/token-lock-form"
import type { LockFormData } from "@/types"
import { TokenLockProgram } from "@/services/token-lock-program"

export default function Home() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const { connection } = useConnection()
  const [isProcessing, setIsProcessing] = useState(false)
  const [txSignature, setTxSignature] = useState<string | null>(null)

  const handleSubmit = async (formData: LockFormData) => {
    if (!publicKey || !signTransaction || !signAllTransactions || !formData.selectedToken) return

    setIsProcessing(true)
    try {
      // Create an AnchorProvider
      const provider = new AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction,
          signAllTransactions,
        },
        { commitment: "confirmed" },
      )

      const tokenLockProgram = new TokenLockProgram(provider)

      // Initialize the vault if needed
      await tokenLockProgram.initialize(publicKey)

      // Deposit tokens
      const recipientPublicKey = new PublicKey(formData.recipientAddress)
      const txId = await tokenLockProgram.deposit(publicKey, formData.amount)

      setTxSignature(txId)
      console.log("Transaction successful:", txId)
    } catch (error) {
      console.error("Error creating token lock:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-12">
            <h1 className="text-3xl font-bold mb-8">Connect your wallet to create a token lock</h1>
            <WalletConnectButton />
          </div>

          {publicKey ? (
            <>
              {txSignature ? (
                <div className="bg-card p-6 rounded-lg text-center">
                  <h2 className="text-xl font-semibold mb-4">Token Lock Created Successfully!</h2>
                  <p className="mb-4">Transaction Signature:</p>
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline break-all"
                  >
                    {txSignature}
                  </a>
                  <button
                    onClick={() => setTxSignature(null)}
                    className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                  >
                    Create Another Lock
                  </button>
                </div>
              ) : (
                <TokenLockForm onSubmit={handleSubmit} />
              )}
            </>
          ) : (
            <div className="bg-card p-6 rounded-lg text-center">
            
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

