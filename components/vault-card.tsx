import type { PublicKey } from "@solana/web3.js"

interface VaultCardProps {
  vaultAddress: PublicKey
  balanceLamports: number
  authority: PublicKey
  recipient: PublicKey
  cancelPermission: number
  changeRecipientPermission: number
}

export const VaultCard = ({
  vaultAddress,
  balanceLamports,
  authority,
  recipient,
  cancelPermission,
  changeRecipientPermission,
}: VaultCardProps) => {
  const balanceSOL = balanceLamports / 1_000_000_000

  const formatPermission = (value: number) => {
    switch (value) {
      case 0:
        return "None"
      case 1:
        return "Recipient"
      case 2:
        return "Creator"
      case 3:
        return "Both"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="bg-card p-5 rounded-lg border border-border mb-4">
      <h3 className="text-lg font-semibold text-foreground mb-2">🔒 Vault Details</h3>

      <p className="text-sm text-muted-foreground mb-1">
        <span className="font-medium text-foreground">Vault Address:</span>
        <br />
        {vaultAddress?.toBase58?.() ?? "—"}
      </p>

      <p className="text-sm text-muted-foreground mb-1">
        <span className="font-medium text-foreground">Authority:</span>
        <br />
        {authority?.toBase58?.() ?? "—"}
      </p>

      <p className="text-sm text-muted-foreground mb-1">
        <span className="font-medium text-foreground">Recipient:</span>
        <br />
        {recipient?.toBase58?.() ?? "—"}
      </p>

      <p className="text-sm text-muted-foreground mt-2">
        <span className="font-medium text-foreground">Balance:</span> {balanceSOL.toFixed(4)} SOL
      </p>

      <div className="text-sm text-muted-foreground mt-2">
        <p>
          <span className="font-medium text-foreground">Who can cancel:</span> {formatPermission(cancelPermission)}
        </p>
        <p>
          <span className="font-medium text-foreground">Who can change recipient:</span>{" "}
          {formatPermission(changeRecipientPermission)}
        </p>
      </div>
    </div>
  )
}
