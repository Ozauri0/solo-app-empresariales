'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const validateAuth = async () => {
      try {
        // Comprobar si hay un token
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No token found')
        }
        
        // Verificar el token y obtener información del usuario directamente del backend
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Token inválido')
        }
        
        // Obtener datos del usuario desde la respuesta del servidor
        const userData = await response.json()
        
        // Verificar si es ruta de administrador y el usuario tiene permisos
        if (adminOnly && userData.user.role !== 'admin') {
          toast.error('Acceso restringido', {
            description: 'No tienes permisos para acceder a esta sección'
          })
          router.push('/dashboard')
          return
        }
        
        // Actualizar el estado con la información verificada por el servidor
        setUserRole(userData.user.role)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error de autenticación:', error)
        // Limpiar datos de autenticación
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        toast.error('Sesión inválida', {
          description: 'Por favor, inicia sesión de nuevo para continuar.'
        })
        
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    validateAuth()
  }, [router, adminOnly])

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Verificando credenciales...</p>
        </div>
      </div>
    )
  }

  // Solo mostrar el contenido si está autenticado y tiene los permisos necesarios
  return isAuthenticated ? <>{children}</> : null
}