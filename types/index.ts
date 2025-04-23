export enum PermissionType {
  NONE = 0,
  RECIPIENT = 1,
  CREATOR = 2,
  BOTH = 3,
}

export type LockFormData = {
  title: string
  amount: number
  recipientAddress: string
  cancelPermission: PermissionType
  changeRecipientPermission: PermissionType
  releaseTime: string
  lockDuration: number
}

import type { PublicKey } from "@solana/web3.js"

export interface TokenInfo {
  mint: PublicKey
  symbol: string
  name: string
  decimals: number
  balance?: number
  icon?: string
}
