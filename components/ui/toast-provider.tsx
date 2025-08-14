"use client"

import { Toaster } from "@/components/ui/sonner"

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
        className:
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        descriptionClassName: "group-[.toast]:text-muted-foreground",
        actionButtonClassName: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButtonClassName: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      }}
    />
  )
}
