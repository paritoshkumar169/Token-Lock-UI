"use client"

import type React from "react"
import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { PermissionSelector } from "./permission-selector"
import { type LockFormData, PermissionType } from "@/types"

interface TokenLockFormProps {
  onSubmit: (data: LockFormData) => void
}

export const TokenLockForm = ({ onSubmit }: TokenLockFormProps) => {
  const { publicKey } = useWallet()

  const [formData, setFormData] = useState<LockFormData>({
    title: "",
    amount: 0,
    recipientAddress: "",
    cancelPermission: PermissionType.NONE,
    changeRecipientPermission: PermissionType.NONE,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = Number.parseFloat(e.target.value) || 0
    setFormData({ ...formData, amount })
  }

  const handleCancelPermissionChange = (value: PermissionType) => {
    setFormData({ ...formData, cancelPermission: value })
  }

  const handleChangeRecipientPermissionChange = (value: PermissionType) => {
    setFormData({ ...formData, changeRecipientPermission: value })
  }

  const isValidSolanaAddress = (address: string) => {
    try {
      new PublicKey(address)
      return true
    } catch (error) {
      return false
    }
  }

  const isFormValid =
    formData.title.trim() !== "" && formData.amount > 0 && isValidSolanaAddress(formData.recipientAddress)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Lock Native SOL</h2>
        <div className="bg-card p-6 rounded-lg space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-foreground">
              Lock Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="eg: Team Tokens"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 bg-input text-foreground rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-foreground">
              Amount (in SOL)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount || ""}
              onChange={handleAmountChange}
              className="w-full p-3 bg-input text-foreground rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="recipientAddress" className="block text-sm font-medium text-foreground">
              Recipient Wallet Address
            </label>
            <div className="space-y-1">
              <input
                type="text"
                id="recipientAddress"
                name="recipientAddress"
                placeholder="Enter recipient wallet address"
                value={formData.recipientAddress}
                onChange={handleInputChange}
                className="w-full p-3 bg-input text-foreground rounded-lg"
              />
              <p className="text-xs text-gray-400">Recipient must manually claim tokens</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PermissionSelector
              label="Who can cancel the contract?"
              value={formData.cancelPermission}
              onChange={handleCancelPermissionChange}
            />
            <PermissionSelector
              label="Who can change the recipient?"
              value={formData.changeRecipientPermission}
              onChange={handleChangeRecipientPermissionChange}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
            disabled={!isFormValid}
          >
            Lock SOL
          </button>
        </div>
      </div>
    </form>
  )
}
