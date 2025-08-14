import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle } from "lucide-react"

interface FormFieldProps {
  label?: string
  error?: string
  success?: string
  description?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({ label, error, success, description, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && !error && !success && <p className="text-xs text-gray-500">{description}</p>}
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="h-3 w-3" />
          <p className="text-xs">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="h-3 w-3" />
          <p className="text-xs">{success}</p>
        </div>
      )}
    </div>
  )
}
