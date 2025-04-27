'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "@/components/ui/course-card"
import { AnnouncementCard } from "@/components/ui/announcement-card"
import { CalendarCard } from "@/components/ui/calendar-card"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Comprobar si hay un usuario autenticado
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      // Si no hay token o datos de usuario, redirigir al login
      router.push('/')
      return
    }
    
    try {
      // Parsear los datos del usuario
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // Verificar token con el backend (opcional, para mayor seguridad)
      verifyToken(token)
    } catch (error) {
      console.error('Error al procesar datos de usuario:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/')
    } finally {
      setLoading(false)
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
      
      // Token válido, actualizar datos del usuario con los más recientes
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error al verificar token:', error)
      // Si el token es inválido, redirigir al login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/')
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

  const courses = [
    {
      id: "1",
      code: "CS101",
      name: "Introducción a la Programación",
      instructor: "Dr. Juan Pérez",
      image: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "2",
      code: "MAT202",
      name: "Cálculo Avanzado",
      instructor: "Dra. María González",
      image: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "3",
      code: "HIS105",
      name: "Historia Contemporánea",
      instructor: "Prof. Carlos Rodríguez",
      image: "/placeholder.svg?height=100&width=200",
    },
  ]

  const announcements = [
    {
      id: "1",
      title: "Mantenimiento programado",
      content: "El sistema estará en mantenimiento el próximo sábado de 2:00 AM a 5:00 AM.",
      date: "2024-04-18",
    },
    {
      id: "2",
      title: "Nuevos cursos disponibles",
      content: "Se han añadido nuevos cursos para el próximo semestre. Revisa el catálogo.",
      date: "2024-04-15",
    },
  ]

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
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle>
              {userRole === 'student' ? 'Mis Cursos' : userRole === 'teacher' ? 'Cursos que Imparto' : 'Todos los Cursos'}
            </CardTitle>
            <CardDescription>
              {userRole === 'student' ? 'Cursos en los que estás inscrito actualmente' : 
               userRole === 'teacher' ? 'Cursos que estás impartiendo este semestre' :
               'Listado de todos los cursos disponibles'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <AnnouncementCard announcements={announcements} />
          <CalendarCard />
        </div>
      </div>
    </div>
  )
}
