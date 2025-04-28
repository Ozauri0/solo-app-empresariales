import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { AuthProvider } from "@/context/AuthContext" // Importamos el AuthProvider

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Campus Virtual LP",
  description: "Plataforma de aprendizaje en línea LP",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="light" style={{ colorScheme: "light" }}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Toaster position="top-center" richColors closeButton />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
