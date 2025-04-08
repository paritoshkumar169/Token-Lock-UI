import type { PublicKey } from "@solana/web3.js"
export interface LockFormData {
  title: string
  amount: number
  recipientAddress: string
  cancelPermission: PermissionType
  changeRecipientPermission: PermissionType
}

export enum PermissionType {
  NONE = "none",
  CREATOR = "creator",
  RECIPIENT = "recipient",
  BOTH = "both",
}


