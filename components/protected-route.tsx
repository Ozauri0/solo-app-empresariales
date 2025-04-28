'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Comprobar si hay un usuario autenticado
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      // Si no hay token o datos de usuario, redirigir al login
      toast.error('Acceso denegado', {
        description: 'Debes iniciar sesión para acceder a esta página'
      })
      router.push('/')
      return
    }
    
    try {
      // Parsear los datos del usuario para verificar que son válidos
      const parsedUser = JSON.parse(userData)
      
      // Verificar token con el backend
      verifyToken(token)
    } catch (error) {
      console.error('Error al procesar datos de usuario:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      toast.error('Sesión inválida', {
        description: 'Tu sesión es inválida. Por favor, inicia sesión de nuevo.'
      })
      router.push('/')
    }
  }, [router])

  // Función para verificar el token con el backend
  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Token inválido')
      }
      
      // Token válido
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Error al verificar token:', error)
      // Si el token es inválido, redirigir al login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      toast.error('Sesión expirada', {
        description: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.'
      })
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si está autenticado, mostrar el contenido
  return isAuthenticated ? <>{children}</> : null
}