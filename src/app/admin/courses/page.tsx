'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/lib/utils'
import { AlertCircle, PlusCircle, Search, X } from 'lucide-react'
import { Pencil as PencilIcon, Trash as TrashIcon } from 'lucide-react'
import AdminNav from '@/components/admin/admin-nav'

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import ProtectedRoute from '@/components/protected-route'

interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface Course {
  _id: string;
  title: string;
  code: string;
  description: string;
  instructor: any;
  students: any[];
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  startDate: string;
  endDate: string;
  createdAt: string;
}

export default function CoursesAdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const [courseForm, setCourseForm] = useState({
    title: '',
    code: '',
    description: '',
    instructorId: '',
    schedule: {
      days: [] as string[],
      startTime: '',
      endTime: ''
    },
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchCourses()
        ])
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
      } else {
        toast.error('Error al cargar usuarios', {
          description: data.message
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setCourses(data.courses)
      } else {
        toast.error('Error al cargar cursos', {
          description: data.message
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      let url = `${API_BASE_URL}/api/courses`
      let method = 'POST'
      
      if (editMode && selectedItem) {
        url = `${API_BASE_URL}/api/courses/${selectedItem._id}`
        method = 'PUT'
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseForm)
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(editMode ? 'Curso actualizado' : 'Curso creado', {
          description: editMode 
            ? 'Los datos del curso han sido actualizados' 
            : 'Se ha creado un nuevo curso en el sistema'
        })
        setShowCourseModal(false)
        fetchCourses()
        resetCourseForm()
      } else {
        toast.error('Error', {
          description: data.message
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Curso eliminado', {
          description: 'El curso ha sido eliminado del sistema'
        })
        fetchCourses()
      } else {
        toast.error('Error', {
          description: data.message
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  const handleEditCourse = (course: Course) => {
    setCourseForm({
      title: course.title,
      code: course.code,
      description: course.description,
      instructorId: course.instructor?._id || '',
      schedule: course.schedule || {
        days: [],
        startTime: '',
        endTime: ''
      },
      startDate: new Date(course.startDate).toISOString().split('T')[0],
      endDate: new Date(course.endDate).toISOString().split('T')[0]
    })
    setSelectedItem(course)
    setEditMode(true)
    setShowCourseModal(true)
  }

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      code: '',
      description: '',
      instructorId: '',
      schedule: {
        days: [],
        startTime: '',
        endTime: ''
      },
      startDate: '',
      endDate: ''
    })
    setSelectedItem(null)
    setEditMode(false)
  }

  const handleCourseFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'startDate' || name === 'endDate' || name === 'title' || name === 'code' || name === 'description' || name === 'instructorId') {
      setCourseForm(prev => ({
        ...prev,
        [name]: value
      }))
    } else if (name.startsWith('schedule.')) {
      const scheduleField = name.split('.')[1]
      setCourseForm(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [scheduleField]: value
        }
      }))
    }
  }

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const goBackToAdminPanel = () => {
    router.push('/admin');
  }

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Cargando...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="space-y-6">
        {/* Componente de navegación compartido */}
        <AdminNav />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestión de Cursos</CardTitle>
                <CardDescription>Administra los cursos disponibles en el sistema</CardDescription>
              </div>
              <Button onClick={() => {
                resetCourseForm()
                setEditMode(false)
                setShowCourseModal(true)
              }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Curso
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por nombre o código del curso..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiantes</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map(course => (
                          <tr key={course._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{course.code}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {course.instructor?.name || 'No asignado'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {course.students?.length || 0} estudiantes
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditCourse(course)}
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                onClick={() => handleDeleteCourse(course._id)}
                              >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center">
                              <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                              No se encontraron cursos que coincidan con la búsqueda
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {showCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2"
                onClick={() => setShowCourseModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <h2 className="text-xl font-bold mb-4">
                {editMode ? 'Editar Curso' : 'Crear Nuevo Curso'}
              </h2>
              
              <form onSubmit={handleSubmitCourse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nombre del curso</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={courseForm.title} 
                    onChange={handleCourseFormChange} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code">Código del curso</Label>
                  <Input 
                    id="code" 
                    name="code" 
                    value={courseForm.code} 
                    onChange={handleCourseFormChange} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={courseForm.description} 
                    onChange={handleCourseFormChange} 
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructorId">Instructor</Label>
                  <Select 
                    name="instructorId" 
                    value={courseForm.instructorId}
                    onValueChange={(value) => setCourseForm(prev => ({ ...prev, instructorId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter(user => user.role === 'teacher' || user.role === 'admin')
                        .map(user => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de inicio</Label>
                    <Input 
                      id="startDate" 
                      name="startDate" 
                      type="date" 
                      value={courseForm.startDate} 
                      onChange={handleCourseFormChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de fin</Label>
                    <Input 
                      id="endDate" 
                      name="endDate" 
                      type="date" 
                      value={courseForm.endDate} 
                      onChange={handleCourseFormChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCourseModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editMode ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}