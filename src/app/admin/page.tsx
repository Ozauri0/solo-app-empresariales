'use client'

import { useEffect } from 'react'
import { useRouter } from "next/navigation"
import ProtectedRoute from '@/components/protected-route'

export default function AdminPage() {
  const router = useRouter()

  // Redirigir automáticamente a la sección de usuarios
  useEffect(() => {
    router.push('/admin/users')
  }, [router])

  return (
    <ProtectedRoute adminOnly>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Redirigiendo...</p>
        </div>
      </div>
    </ProtectedRoute>
  )
}