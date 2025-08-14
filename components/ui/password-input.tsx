"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean
}

export function PasswordInput({ showStrength = false, className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState(0)

  const calculateStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    return score
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showStrength) {
      setStrength(calculateStrength(e.target.value))
    }
    props.onChange?.(e)
  }

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500"
    if (strength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (strength <= 2) return "Weak"
    if (strength <= 3) return "Medium"
    return "Strong"
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          {...props}
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          onChange={handleChange}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
        </Button>
      </div>
      {showStrength && props.value && (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={cn("h-2 rounded-full transition-all", getStrengthColor())}
                style={{ width: `${(strength / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{getStrengthText()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
