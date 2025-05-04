import type React from "react"

export default function AdminRegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {children}
      </div>
    </div>
  )
}