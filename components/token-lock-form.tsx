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
    releaseTime: "",
    lockDuration: 0,
  })
  const [amountError, setAmountError] = useState("")

  // Helper to validate a Solana address format
  const isValidSolanaAddress = (address: string) => {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "releaseTime") {
      // Calculate lock duration (in seconds) from now until the selected release time
      let durationSec = 0
      if (value) {
        const selectedTime = new Date(value).getTime()
        const nowTime = Date.now()
        durationSec = Math.floor((selectedTime - nowTime) / 1000)
        if (durationSec < 0) durationSec = 0 // no negative durations
      }
      setFormData({
        ...formData,
        releaseTime: value,
        lockDuration: durationSec,
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = Number.parseFloat(e.target.value) || 0

    // Check if amount is negative and set error message
    if (amount < 0) {
      setAmountError("are u retarded?")
    } else {
      setAmountError("")
    }

    setFormData({ ...formData, amount: Math.max(0, amount) }) // Ensure amount is never negative
  }

  const handleCancelPermissionChange = (value: PermissionType) => {
    setFormData({ ...formData, cancelPermission: value })
  }

  const handleChangeRecipientPermissionChange = (value: PermissionType) => {
    setFormData({ ...formData, changeRecipientPermission: value })
  }

  // Form is valid if title is set, amount > 0, recipient address is valid, and release time is chosen
  const isFormValid =
    formData.title.trim() !== "" &&
    formData.amount > 0 &&
    isValidSolanaAddress(formData.recipientAddress) &&
    formData.lockDuration > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    onSubmit(formData)
  }

  // Set minimum allowed datetime to now (prevent selecting past time)
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hour = String(now.getHours()).padStart(2, "0")
  const minute = String(now.getMinutes()).padStart(2, "0")
  const minDatetime = `${year}-${month}-${day}T${hour}:${minute}`

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Lock Native SOL</h2>
        <div className="bg-card p-6 rounded-lg space-y-6">
          {/* Lock title input */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-foreground">
              Lock Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g. Team Tokens"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 bg-white text-black rounded-lg"
            />
          </div>

          {/* Amount to lock input */}
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
              className="w-full p-3 bg-white text-black rounded-lg"
            />
            {amountError && <p className="text-red-500 text-sm mt-1">{amountError}</p>}
          </div>

          {/* Recipient address input */}
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
                className="w-full p-3 bg-white text-black rounded-lg"
              />
              <p className="text-xs text-gray-400">Recipient must manually claim tokens after release.</p>
            </div>
          </div>

          {/* Release time picker input */}
          <div className="space-y-2">
            <label htmlFor="releaseTime" className="block text-sm font-medium text-foreground">
              Release Time (Unlock Date &amp; Time)
            </label>
            <div className="space-y-1">
              <input
                type="datetime-local"
                id="releaseTime"
                name="releaseTime"
                value={formData.releaseTime}
                min={minDatetime}
                onChange={handleInputChange}
                className="w-full p-3 bg-white text-black rounded-lg"
              />
              <p className="text-xs text-gray-400">Select the date and time when locked tokens become available.</p>
            </div>
          </div>

          {/* Permission selectors */}
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
            disabled={!isFormValid}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
          >
            {publicKey ? "Lock Tokens" : "Connect Wallet"}
          </button>
        </div>
      </div>
    </form>
  )
}
