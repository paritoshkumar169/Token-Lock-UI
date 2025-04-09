"use client"

import { useEffect, useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { AnchorProvider } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import Link from "next/link"
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

  useEffect(() => {
    if (publicKey && signTransaction && signAllTransactions) {
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { commitment: "confirmed" }
      )
      const tokenLockProgram = new TokenLockProgram(provider)
      tokenLockProgram
        .getVaultInfo(publicKey)
        .then((data) => {
          if (data) {
            setVaultData(data)
          }
        })
        .catch((err) => console.error("Error fetching vault info on mount:", err))
    }
  }, [publicKey, signTransaction, signAllTransactions, connection])

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

      await tokenLockProgram.initialize(publicKey, formData)
  
      const txId = await tokenLockProgram.deposit(publicKey, formData.amount)
      console.log("Transaction successful:", txId)

      const data = await tokenLockProgram.getVaultInfo(publicKey)
      setVaultData(data)

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
            <h1 className="text-3xl font-bold mb-8">
              Connect your wallet to create a token lock
            </h1>
            <WalletConnectButton />
          </div>

          {publicKey ? (
            <>
              {/* Show "Current Locks" button if a vault exists */}
              {vaultData && (
                <div className="mb-6 flex justify-end">
                  <Link href={`/vault/${vaultData.vaultAddress.toBase58()}`}>
                    <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90">
                      Current Locks
                    </button>
                  </Link>
                </div>
              )}

              {txSignature ? (
                // Success state: Vault created successfully
                <div className="bg-card p-6 rounded-lg text-center">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">
                    🎉 Token Lock Created Successfully!
                  </h2>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Transaction Signature:
                  </p>
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-400 hover:underline break-words text-sm mb-4"
                  >
                    {txSignature}
                  </a>
                  {/* Display vault details if available */}
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
                      onClick={() => setTxSignature(null)}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                    >
                      Create Another Lock
                    </button>
                  </div>
                </div>
              ) : (
                // Form state: No lock created yet (or creating another lock)
                <>
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
              <p className="text-muted-foreground">
                Please connect your wallet to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
