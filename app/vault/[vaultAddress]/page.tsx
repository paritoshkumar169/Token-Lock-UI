"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useRouter, useParams } from "next/navigation"
import { AnchorProvider } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { TokenLockProgram } from "@/services/token-lock-program"
import { VaultCard } from "@/components/vault-card"

export default function VaultDetailsPage() {
  const { vaultAddress } = useParams() as { vaultAddress: string }
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()

  // Ensure the wallet is connected before proceeding.
  if (!publicKey || !signTransaction || !signAllTransactions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Please connect your wallet to view vault details.</p>
      </div>
    )
  }

  const [vaultData, setVaultData] = useState<{
    vaultAddress: PublicKey
    balanceLamports: number
    authority: PublicKey
    recipient: PublicKey
    cancelPermission: number
    changeRecipientPermission: number
    lockUntil: number
  } | null>(null)
  const [txLoading, setTxLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, signAllTransactions },
    { commitment: "confirmed" }
  )
  const tokenLockProgram = new TokenLockProgram(provider)

  async function fetchVaultInfo() {
    if (!vaultAddress) return
    try {
      const vaultPDA = new PublicKey(vaultAddress)
      const accountInfo = await connection.getAccountInfo(vaultPDA)
      if (!accountInfo) {
        setVaultData(null)
        return
      }
      const vaultAccount = (await tokenLockProgram.program.account.vault.fetch(
        vaultPDA
      )) as any
      setVaultData({
        vaultAddress: vaultPDA,
        balanceLamports: accountInfo.lamports,
        authority: vaultAccount.authority as PublicKey,
        recipient: vaultAccount.recipient as PublicKey,
        cancelPermission: vaultAccount.cancelPermission as number,
        changeRecipientPermission: vaultAccount.changeRecipientPermission as number,
        lockUntil: vaultAccount.lockUntil as number,
      })
    } catch (error) {
      setVaultData(null)
      setErrorMessage("Error fetching vault info.")
    }
  }

  useEffect(() => {
    fetchVaultInfo()
  }, [vaultAddress, publicKey])

  const canUnlock = vaultData ? Date.now() / 1000 >= vaultData.lockUntil : false

  const canCancel = () => {
    if (!vaultData || !publicKey) return false
    const userKey = publicKey.toBase58()
    const vaultAuthority = vaultData.authority.toBase58()
    const vaultRecipient = vaultData.recipient.toBase58()
    switch (vaultData.cancelPermission) {
      case 1:
        return userKey === vaultRecipient
      case 2:
        return userKey === vaultAuthority
      case 3:
        return userKey === vaultAuthority || userKey === vaultRecipient
      default:
        return false
    }
  }

  const handleUnlock = async () => {
    setTxLoading(true)
    setErrorMessage("")
    setSuccessMessage("")
    try {
      const txSig = await tokenLockProgram.unlock(publicKey)
      setSuccessMessage(`Unlock successful! Transaction: ${txSig}`)
      fetchVaultInfo()
    } catch (err: any) {
      setErrorMessage(err.message || "Error during unlock")
    } finally {
      setTxLoading(false)
    }
  }

  const handleCancel = async () => {
    setTxLoading(true)
    setErrorMessage("")
    setSuccessMessage("")
    try {
      const txSig = await tokenLockProgram.cancel(publicKey)
      setSuccessMessage(`Cancellation successful! Transaction: ${txSig}`)
      fetchVaultInfo()
    } catch (err: any) {
      setErrorMessage(err.message || "Error during cancellation")
    } finally {
      setTxLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto bg-card p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Vault Details</h1>
        {vaultData ? (
          <>
            <VaultCard
              vaultAddress={vaultData.vaultAddress}
              balanceLamports={vaultData.balanceLamports}
              authority={vaultData.authority}
              recipient={vaultData.recipient}
              cancelPermission={vaultData.cancelPermission}
              changeRecipientPermission={vaultData.changeRecipientPermission}
            />
            <p className="mt-4">
              <span className="font-medium">Lock Until:</span>{" "}
              {new Date(vaultData.lockUntil * 1000).toLocaleString()}
            </p>
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              {canUnlock && (
                <button
                  onClick={handleUnlock}
                  disabled={txLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium"
                >
                  {txLoading ? "Processing..." : "Claim Tokens"}
                </button>
              )}
              {canCancel() && (
                <button
                  onClick={handleCancel}
                  disabled={txLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium"
                >
                  {txLoading ? "Processing..." : "Cancel Token Lock"}
                </button>
              )}
            </div>
            {errorMessage && (
              <p className="mt-4 text-red-500">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="mt-4 text-green-500">{successMessage}</p>
            )}
            <div className="mt-6">
              <button
                onClick={() => router.back()}
                className="text-blue-500 underline"
              >
                Go Back
              </button>
            </div>
          </>
        ) : (
          <p>No vault information found.</p>
        )}
      </div>
    </main>
  )
}
