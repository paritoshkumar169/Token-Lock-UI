import { PublicKey } from "@solana/web3.js"

interface VaultCardProps {
  vaultAddress: PublicKey
  balanceLamports: number
  authority: PublicKey
}

export const VaultCard = ({
  vaultAddress,
  balanceLamports,
  authority,
}: VaultCardProps) => {
  const balanceSOL = balanceLamports / 1_000_000_000

  return (
    <div className="bg-card p-5 rounded-lg border border-border mb-4">
      <h3 className="text-lg font-semibold text-foreground mb-2">🔒 Vault Details</h3>

      <p className="text-sm text-muted-foreground mb-1">
        <span className="font-medium text-foreground">Vault Address:</span><br />
        {vaultAddress.toBase58()}
      </p>

      <p className="text-sm text-muted-foreground mb-1">
        <span className="font-medium text-foreground">Authority:</span><br />
        {authority.toBase58()}
      </p>

      <p className="text-sm text-muted-foreground mt-2">
        <span className="font-medium text-foreground">Balance:</span> {balanceSOL.toFixed(4)} SOL
      </p>
    </div>
  )
}
