"use client"

import { useEffect, useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { AnchorProvider } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { TokenLockForm } from "@/components/token-lock-form"
import type { LockFormData } from "@/types"
import { TokenLockProgram } from "@/services/token-lock-program"
import { VaultCard } from "@/components/vault-card"

export default function Home() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const { connection } = useConnection()

  const [isProcessing, setIsProcessing] = useState(false)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [vaultData, setVaultData] = useState<{
    vaultAddress: PublicKey
    balanceLamports: number
    authority: PublicKey
    recipient: PublicKey
    cancelPermission: number
    changeRecipientPermission: number
  } | null>(null)

  const handleSubmit = async (formData: LockFormData) => {
    if (!publicKey || !signTransaction || !signAllTransactions) return

    setIsProcessing(true)
    try {
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { commitment: "confirmed" }
      )
      const tokenLockProgram = new TokenLockProgram(provider)

      // Initialize vault (only creates if not already created)
      await tokenLockProgram.initialize(publicKey, formData)
      // Deposit the specified amount into the vault
      const txId = await tokenLockProgram.deposit(publicKey, formData.amount)
      console.log("Transaction successful:", txId)

      // After successful transaction confirmation, fetch the vault info
      const data = await tokenLockProgram.getVaultInfo(publicKey)
      setVaultData(data)  // will be non-null if vault is initialized

      setTxSignature(txId)
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
                // **Success state:** Vault created successfully
                <div className="bg-card p-6 rounded-lg text-center">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">
                    🎉 Token Lock Created Successfully!
                  </h2>
                  <p className="mb-2 text-sm text-muted-foreground">Transaction Signature:</p>
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-400 hover:underline break-words text-sm mb-4"
                  >
                    {txSignature}
                  </a>
                  {/* Display vault details once available */}
                  {vaultData ? (
                    <VaultCard
                      vaultAddress={vaultData.vaultAddress}
                      balanceLamports={vaultData.balanceLamports}
                      authority={vaultData.authority}
                      recipient={vaultData.recipient}
                      cancelPermission={vaultData.cancelPermission}
                      changeRecipientPermission={vaultData.changeRecipientPermission}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm mb-4">
                      Loading vault details&hellip;
                    </p>
                  )}
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => {
                        // Reset state to allow creating another lock (vault persists)
                        setTxSignature(null)
                      }}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                    >
                      Create Another Lock
                    </button>
                  </div>
                </div>
              ) : (
                // **Form state:** No lock created yet (or creating another lock)
                <>
                  {vaultData ? (
                    <div className="mb-8">
                      <VaultCard
                        vaultAddress={vaultData.vaultAddress}
                        balanceLamports={vaultData.balanceLamports}
                        authority={vaultData.authority}
                        recipient={vaultData.recipient}
                        cancelPermission={vaultData.cancelPermission}
                        changeRecipientPermission={vaultData.changeRecipientPermission}
                      />
                    </div>
                  ) : (
                    <div className="mb-8 text-muted-foreground text-sm">
                      No vault created yet.
                    </div>
                  )}
                  <TokenLockForm onSubmit={handleSubmit} />
                </>
              )}
            </>
          ) : (
            // Prompt to connect wallet if not connected
            <div className="bg-card p-6 rounded-lg text-center">
              <p className="text-muted-foreground">Please connect your wallet to get started.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
