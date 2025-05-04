"use client"

import { useAuth } from "@/context/AuthContext"

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  return (
    <div className="container py-6 max-w-7xl">
      {children}
    </div>
  )
}