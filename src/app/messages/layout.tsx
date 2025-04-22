import type React from "react"
import { Sidebar } from "@/components/ui/sidebar"
import { Header } from "@/components/ui/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
        <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
          © 2025 LP Campus Virtual. Todos los derechos reservados.
        </footer>
      </div>
    </div>
  )
}
