'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "@/components/ui/course-card"
import { CalendarCard } from "@/components/ui/calendar-card"
import { NewsCard } from "@/components/ui/news-card"
import { CourseNotificationsCard } from "@/components/ui/course-notifications-card"
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [visibleNews, setVisibleNews] = useState<any>(null)
  const [courseNotifications, setCourseNotifications] = useState([])
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    // Comprobar si hay un usuario autenticado
    const storedToken = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!storedToken || !userData) {
      // Si no hay token o datos de usuario, redirigir al login
      router.push('/')
      return
    }
    
    try {
      // Parsear los datos del usuario
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setToken(storedToken)
      
      // Verificar token con el backend y cargar datos
      verifyToken(storedToken)
      loadDashboardData(storedToken)
    } catch (error) {
      console.error('Error al procesar datos de usuario:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/')
    }
  }, [router])

  // Función para verificar el token con el backend
  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Token inválido')
      }
      
      // Token válido, actualizar datos del usuario con los más recientes
      const data = await response.json()
      setUser(data.user)
      setLoading(false)
    } catch (error) {
      console.error('Error al verificar token:', error)
      // Si el token es inválido, redirigir al login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/')
    }
  }

  // Función para cargar los datos del dashboard
  const loadDashboardData = async (token: string) => {
    try {
      // Cargar la noticia visible para el dashboard
      const newsResponse = await fetch(`${API_BASE_URL}/api/news/visible`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (newsResponse.ok) {
        const newsData = await newsResponse.json()
        setVisibleNews(newsData.news)  // Puede ser null si no hay noticias visibles
      }

      // Cargar notificaciones de cursos
      const notificationsResponse = await fetch(`${API_BASE_URL}/api/notifications/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        
        // Asegurar que las notificaciones tienen la estructura correcta
        // y añadir la propiedad isRead basada en readBy
        const formattedNotifications = notificationsData.map((notification: any) => {
          // Verificar si el usuario actual ha leído esta notificación
          const userId = user?._id || user?.id
          const isRead = notification.readBy?.some((read: any) => 
            read.user && (read.user === userId || read.user.toString() === userId?.toString())
          ) || false
          
          return {
            _id: notification._id,
            title: notification.title,
            message: notification.message,
            sender: notification.sender,
            courseId: notification.courseId,
            createdAt: notification.createdAt,
            isRead: isRead
          }
        })
        
        setCourseNotifications(formattedNotifications)
      }
      
      // Cargar cursos (ejemplo, reemplazar con API real)
      
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
      toast.error('Error al cargar datos del dashboard')
    }
  }

  // Función para actualizar notificaciones cuando se marcan como leídas
  const handleNotificationUpdate = () => {
    if (token) {
      loadDashboardData(token)
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

  // Determinar el rol del usuario para mostrar interfaz adecuada
  const userRole = user?.role || 'student'

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Bienvenido, {user?.name || 'Usuario'}
        {userRole !== 'student' && (
          <span className="ml-2 text-sm font-normal bg-slate-200 px-2 py-1 rounded-full">
            {userRole === 'teacher' ? 'Profesor' : userRole === 'admin' ? 'Administrador' : ''}
          </span>
        )}
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Sección de Noticias - Ocupa 2 columnas en pantallas grandes */}
        <div className="col-span-full md:col-span-2">
          <NewsCard news={visibleNews} />
        </div>

        {/* Panel lateral con notificaciones de cursos y calendario */}
        <div className="space-y-6 lg:col-span-1">
          {/* Mostrar notificaciones de cursos */}
          <CourseNotificationsCard 
            notifications={courseNotifications} 
            token={token} 
            onNotificationUpdate={handleNotificationUpdate}
          />
          
          {/* Calendario */}
          <CalendarCard />
        </div>
      </div>
    </div>
  )
}
