"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, FileText, Users } from "lucide-react"
import CourseMaterials from "./components/CourseMaterials"
import CourseStudents from "./components/CourseStudents"
import CourseAlerts from "./components/CourseAlerts"

interface User {
  _id: string
  name: string
  email: string
  username: string
  role: string
}

interface Course {
  _id: string
  title: string
  code: string
  description: string
  instructor: User
  students: User[]
  schedule?: {
    days: string[]
    startTime: string
    endTime: string
  }
  startDate: string
  endDate: string
  createdAt: string
}

interface CourseMaterial {
  _id: string
  title: string
  description: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy: User
  uploadedAt: string
}

export default function CourseDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [isInitialized, setIsInitialized] = useState(false) // Flag para controlar inicialización

  // Cargar datos del curso
  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (isInitialized) return;
    
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUserRole(userData.role)
      setUserId(userData.id)
    }
    
    // Solo hacer peticiones si tenemos un ID de curso
    if (id) {
      setIsInitialized(true); // Marcar como inicializado antes de hacer peticiones
      const loadData = async () => {
        try {
          const courseLoaded = await fetchCourse()
          if (courseLoaded) {
            await fetchMaterials()
          }
        } catch (error) {
          console.error("Error cargando datos:", error);
        }
      }
      
      loadData()
    }
  }, [id])

  // Obtener información del curso
  const fetchCourse = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Error de autenticación', {
          description: 'Por favor, inicia sesión de nuevo'
        })
        return false
      }

      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Acceso denegado', {
            description: 'No tienes permiso para ver este curso'
          })
          router.push('/courses')
          return false
        }
        throw new Error('Error al cargar el curso')
      }

      const data = await response.json()
      if (data.success) {
        setCourse(data.course)
        return true
      } else {
        toast.error('Error', {
          description: data.message || 'Error al cargar el curso'
        })
        return false
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Obtener materiales del curso
  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Se agrega la palabra "courseId" a los logs para debug
      console.log(`Obteniendo materiales para courseId: ${id}`)
      
      // Cambiamos la URL para usar courseId como parámetro
      const response = await fetch(`http://localhost:5000/api/courses/${id}/materials`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMaterials(data.materials)
          console.log(`Materiales cargados: ${data.materials.length}`)
        }
      } else {
        // En caso de error, mostramos el código de estado y la respuesta para depuración
        console.error(`Error al cargar materiales: ${response.status}`)
        const errorText = await response.text()
        console.error(`Detalle del error: ${errorText}`)
        
        // Si la ruta no existe, simplemente iniciamos con un array vacío
        setMaterials([])
      }
    } catch (error) {
      console.error('Error al cargar materiales:', error)
      setMaterials([])
    }
  }

  // Verificar si el usuario es propietario del curso o admin
  const isOwnerOrAdmin = () => {
    if (!course || !userId) return false
    return userRole === 'admin' || (course.instructor && course.instructor._id === userId)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Cargando información del curso...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!course) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg font-medium text-red-500">Curso no encontrado</p>
            <Button onClick={() => router.push('/courses')} className="mt-4">
              Volver a cursos
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Cabecera del curso */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{course.code}</Badge>
              <p className="text-sm text-muted-foreground">
                Instructor: {course.instructor?.name || 'No asignado'}
              </p>
            </div>
          </div>
          <Button onClick={() => router.push('/courses')} variant="outline">
            Volver a cursos
          </Button>
        </div>

        {/* Detalles del curso */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Información del curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Descripción</h3>
                <p className="text-sm text-gray-600 mt-1">{course.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Fecha de inicio
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(course.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Fecha de finalización
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(course.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium flex items-center gap-1">
                  <Users className="w-4 h-4" /> Estudiantes
                </h3>
                <p className="text-2xl font-bold mt-1">{course.students?.length || 0}</p>
              </div>
              <div>
                <h3 className="font-medium flex items-center gap-1">
                  <FileText className="w-4 h-4" /> Materiales
                </h3>
                <p className="text-2xl font-bold mt-1">{materials.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pestañas: Materiales, Estudiantes y Alertas */}
        <Tabs defaultValue="materials" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="materials">Materiales</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="alerts">
              <span className="flex items-center gap-1">
                <Bell className="w-4 h-4" />
                Alertas
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Materiales */}
          <TabsContent value="materials" className="space-y-4">
            <CourseMaterials 
              courseId={id as string} 
              materials={materials} 
              userRole={userRole} 
              fetchMaterials={fetchMaterials} 
            />
          </TabsContent>

          {/* Pestaña de Estudiantes */}
          <TabsContent value="students" className="space-y-4">
            <CourseStudents 
              courseId={id as string} 
              students={course.students || []} 
              userRole={userRole} 
              fetchCourse={async () => { await fetchCourse(); }} 
            />
          </TabsContent>
          
          {/* Pestaña de Alertas */}
          <TabsContent value="alerts" className="space-y-4">
            <CourseAlerts courseId={id as string} />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}