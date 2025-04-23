"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useRouter, useParams } from "next/navigation"
import { AnchorProvider } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { TokenLockProgram } from "@/services/token-lock-program"
import { VaultCard } from "@/components/vault-card"
import { WalletConnectButton } from "@/components/wallet-connect-button"

export default function VaultDetailsPage() {
  const { vaultAddress } = useParams() as { vaultAddress: string }
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()

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
  const [isLoading, setIsLoading] = useState(true)

  // Log the RPC endpoint being used
  useEffect(() => {
    console.log("Vault details page using RPC endpoint:", connection.rpcEndpoint)
  }, [connection])

  useEffect(() => {
    let isMounted = true

    const fetchVaultInfo = async () => {
      if (!vaultAddress) return

      setIsLoading(true)
      setErrorMessage("")

      try {
        // First, validate the vault address is a valid PublicKey
        let vaultPDA: PublicKey
        try {
          vaultPDA = new PublicKey(vaultAddress)
          console.log("Fetching info for vault address:", vaultPDA.toBase58())
        } catch (err) {
          if (isMounted) {
            setErrorMessage("Invalid vault address format")
            setIsLoading(false)
          }
          return
        }

        // Check if the account exists
        let accountInfo
        try {
          console.log("Checking if account exists...")
          accountInfo = await connection.getAccountInfo(vaultPDA)
          if (!accountInfo) {
            console.log("Vault account not found")
            if (isMounted) {
              setVaultData(null)
              setErrorMessage("Vault not found")
              setIsLoading(false)
            }
            return
          }
          console.log("Account exists with data length:", accountInfo.data.length)
        } catch (err) {
          console.error("Error checking account existence:", err)
          if (isMounted) {
            setErrorMessage("Failed to check if vault exists. Network error.")
            setIsLoading(false)
          }
          return
        }

        // If we have a wallet connected, try to fetch the vault data
        if (publicKey && signTransaction && signAllTransactions) {
          try {
            console.log("Creating provider with connection:", connection.rpcEndpoint)
            const provider = new AnchorProvider(
              connection,
              { publicKey, signTransaction, signAllTransactions },
              { commitment: "confirmed" },
            )

            const tokenLockProgram = new TokenLockProgram(provider)

            console.log("Fetching vault account data...")
            const vaultAccount = (await tokenLockProgram.program.account.vault.fetch(vaultPDA)) as any
            console.log("Vault account data:", vaultAccount)

            if (isMounted) {
              setVaultData({
                vaultAddress: vaultPDA,
                balanceLamports: accountInfo.lamports,
                authority: vaultAccount.authority as PublicKey,
                recipient: vaultAccount.recipient as PublicKey,
                cancelPermission: vaultAccount.cancelPermission as number,
                changeRecipientPermission: vaultAccount.changeRecipientPermission as number,
                lockUntil: vaultAccount.lockUntil as number,
              })
            }
          } catch (err) {
            console.error("Error fetching vault account data:", err)
            if (isMounted) {
              setErrorMessage("Failed to fetch vault details. The vault may exist but we couldn't read its data.")
            }
          }
        } else {
          if (isMounted) {
            setErrorMessage("Please connect your wallet to view vault details")
          }
        }
      } catch (err) {
        console.error("Error in fetchVaultInfo:", err)
        if (isMounted) {
          setErrorMessage("An unexpected error occurred")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchVaultInfo()

    return () => {
      isMounted = false
    }
  }, [vaultAddress, publicKey, signTransaction, signAllTransactions, connection])

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
    if (!publicKey || !signTransaction || !signAllTransactions || !vaultData) return

    setTxLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      console.log("Creating provider for unlock...")
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { commitment: "confirmed" },
      )

      const tokenLockProgram = new TokenLockProgram(provider)

      console.log("Unlocking tokens...")
      const txSig = await tokenLockProgram.unlock(publicKey)
      console.log("Unlock successful with tx:", txSig)
      setSuccessMessage(`Unlock successful! Transaction: ${txSig}`)

      // Refresh vault info
      try {
        console.log("Refreshing vault info after unlock...")
        const vaultPDA = vaultData.vaultAddress
        const accountInfo = await connection.getAccountInfo(vaultPDA)

        if (!accountInfo) {
          console.log("Vault no longer exists after unlock")
          setVaultData(null)
          return
        }

        const vaultAccount = (await tokenLockProgram.program.account.vault.fetch(vaultPDA)) as any

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
        console.error("Error refreshing vault info:", error)
      }
    } catch (err: any) {
      console.error("Error during unlock:", err)
      setErrorMessage(err.message || "Error during unlock")
    } finally {
      setTxLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions || !vaultData) return

    setTxLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      console.log("Creating provider for cancel...")
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { commitment: "confirmed" },
      )

      const tokenLockProgram = new TokenLockProgram(provider)

      console.log("Cancelling token lock...")
      const txSig = await tokenLockProgram.cancel(publicKey)
      console.log("Cancel successful with tx:", txSig)
      setSuccessMessage(`Cancellation successful! Transaction: ${txSig}`)

      // Refresh vault info
      try {
        console.log("Refreshing vault info after cancel...")
        const vaultPDA = vaultData.vaultAddress
        const accountInfo = await connection.getAccountInfo(vaultPDA)

        if (!accountInfo) {
          console.log("Vault no longer exists after cancel")
          setVaultData(null)
          return
        }

        const vaultAccount = (await tokenLockProgram.program.account.vault.fetch(vaultPDA)) as any

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
        console.error("Error refreshing vault info:", error)
      }
    } catch (err: any) {
      console.error("Error during cancellation:", err)
      setErrorMessage(err.message || "Error during cancellation")
    } finally {
      setTxLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto bg-card p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Vault Details</h1>

        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading vault information...</p>
          </div>
        ) : (
          <>
            {!publicKey ? (
              <div className="text-center py-8">
                <p className="mb-4">Please connect your wallet to view vault details.</p>
                <div className="flex justify-center">
                  <WalletConnectButton />
                </div>
              </div>
            ) : (
              <>
                {errorMessage && !vaultData && (
                  <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
                    <p>{errorMessage}</p>
                  </div>
                )}

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
                    {errorMessage && <p className="mt-4 text-red-500">{errorMessage}</p>}
                    {successMessage && <p className="mt-4 text-green-500">{successMessage}</p>}
                  </>
                ) : (
                  <p>No vault information found for this address.</p>
                )}
              </>
            )}

            <div className="mt-6">
              <button onClick={() => router.back()} className="text-blue-500 underline">
                Go Back
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
