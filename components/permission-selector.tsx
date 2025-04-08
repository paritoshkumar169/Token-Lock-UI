"use client"

import { useState } from "react"
import { PermissionType } from "@/types"
import { ChevronDown } from "lucide-react"

interface PermissionSelectorProps {
  label: string
  value: PermissionType
  onChange: (value: PermissionType) => void
}

export const PermissionSelector = ({ label, value, onChange }: PermissionSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const options = [
    { value: PermissionType.NONE, label: "None" },
    { value: PermissionType.CREATOR, label: "Creator" },
    { value: PermissionType.RECIPIENT, label: "Recipient" },
    { value: PermissionType.BOTH, label: "Both Creator or Recipient" },
  ]

  const handleSelect = (option: (typeof options)[0]) => {
    onChange(option.value)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <button
          type="button"
          className="flex items-center justify-between w-full p-3 bg-input text-foreground rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{options.find((option) => option.value === value)?.label || "Select"}</span>
          <ChevronDown className="h-5 w-5" />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-card rounded-lg shadow-lg">
            {options.map((option) => (
              <div
                key={option.value}
                className="p-3 hover:bg-input cursor-pointer"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

