'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  PencilIcon, 
  TrashIcon, 
  UserPlus, 
  BookIcon, 
  PlusCircle, 
  Search,
  AlertCircle,
  X,
  UserIcon
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Interfaces para tipado
interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  rut: string;
  program?: string;
  yearOfAdmission?: number;
  activeSessions: any[];
  createdAt: string;
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

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')

  // Estado para manejo de modales
  const [showUserModal, setShowUserModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Estado para formularios
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'student',
    rut: '',
    program: 'Ingeniería Civil Informática'
  })

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

  // Cargar datos al iniciar la página
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

  // Función para obtener todos los usuarios
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await fetch('http://localhost:5000/api/users', {
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

  // Función para obtener todos los cursos
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/courses', {
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

  // Función para crear/actualizar usuario
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      let url = 'http://localhost:5000/api/users/register'
      let method = 'POST'
      
      if (editMode && selectedItem) {
        url = `http://localhost:5000/api/users/${selectedItem._id}`
        method = 'PUT'
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userForm)
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(editMode ? 'Usuario actualizado' : 'Usuario creado', {
          description: editMode 
            ? 'Los datos del usuario han sido actualizados' 
            : 'Se ha creado un nuevo usuario en el sistema'
        })
        setShowUserModal(false)
        fetchUsers()
        resetUserForm()
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

  // Función para crear/actualizar curso
  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      let url = 'http://localhost:5000/api/courses'
      let method = 'POST'
      
      if (editMode && selectedItem) {
        url = `http://localhost:5000/api/courses/${selectedItem._id}`
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

  // Función para eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Usuario eliminado', {
          description: 'El usuario ha sido eliminado del sistema'
        })
        fetchUsers()
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

  // Función para eliminar curso
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
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

  // Función para editar usuario
  const handleEditUser = (user: User) => {
    setUserForm({
      name: user.name,
      email: user.email,
      username: user.username,
      password: '', // No establecemos la contraseña al editar
      role: user.role,
      rut: user.rut || '',
      program: user.program || 'Ingeniería Civil Informática'
    })
    setSelectedItem(user)
    setEditMode(true)
    setShowUserModal(true)
  }

  // Función para editar curso
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

  // Función para resetear formulario de usuario
  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'student',
      rut: '',
      program: 'Ingeniería Civil Informática'
    })
    setSelectedItem(null)
    setEditMode(false)
  }

  // Función para resetear formulario de curso
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

  // Manejar cambios en formulario de usuario
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Manejar cambios en formulario de curso
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

  // Filtrar usuarios según término de búsqueda
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rut?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filtrar cursos según término de búsqueda
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ProtectedRoute adminOnly>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium">Cargando...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="users" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">
                <UserIcon className="mr-2 h-4 w-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="courses">
                <BookIcon className="mr-2 h-4 w-4" />
                Cursos
              </TabsTrigger>
            </TabsList>

            {/* PESTAÑA DE USUARIOS */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestión de Usuarios</CardTitle>
                      <CardDescription>Administra los usuarios registrados en el sistema</CardDescription>
                    </div>
                    <Button onClick={() => {
                      resetUserForm()
                      setEditMode(false)
                      setShowUserModal(true)
                    }}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Nuevo Usuario
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
                          placeholder="Buscar por nombre, email o RUT..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                              <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.username}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge className={
                                    user.role === 'admin' 
                                      ? 'bg-red-100 text-red-800 border-red-500' 
                                      : user.role === 'teacher' 
                                        ? 'bg-blue-100 text-blue-800 border-blue-500'
                                        : 'bg-green-100 text-green-800 border-green-500'
                                  }>
                                    {user.role === 'admin' ? 'Administrador' : 
                                     user.role === 'teacher' ? 'Profesor' : 'Estudiante'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{user.rut || 'No registrado'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <PencilIcon className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                    onClick={() => handleDeleteUser(user._id)}
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
                                  No se encontraron usuarios que coincidan con la búsqueda
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Modal para crear/editar usuario */}
              {showUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-2"
                      onClick={() => setShowUserModal(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <h2 className="text-xl font-bold mb-4">
                      {editMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </h2>
                    
                    <form onSubmit={handleSubmitUser} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={userForm.name} 
                          onChange={handleUserFormChange} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={userForm.email} 
                          onChange={handleUserFormChange} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Nombre de usuario</Label>
                        <Input 
                          id="username" 
                          name="username" 
                          value={userForm.username} 
                          onChange={handleUserFormChange} 
                          required 
                        />
                      </div>
                      
                      {!editMode && (
                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña</Label>
                          <Input 
                            id="password" 
                            name="password" 
                            type="password" 
                            value={userForm.password} 
                            onChange={handleUserFormChange} 
                            required={!editMode}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select 
                          name="role" 
                          value={userForm.role} 
                          onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Estudiante</SelectItem>
                            <SelectItem value="teacher">Profesor</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="rut">RUT</Label>
                        <Input 
                          id="rut" 
                          name="rut" 
                          value={userForm.rut} 
                          onChange={handleUserFormChange} 
                        />
                      </div>

                      <div className="pt-4 flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowUserModal(false)}
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
            </TabsContent>

            {/* PESTAÑA DE CURSOS */}
            <TabsContent value="courses" className="space-y-4">
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

                    <div className="border rounded-md overflow-hidden">
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
                </CardContent>
              </Card>

              {/* Modal para crear/editar curso */}
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
                        <textarea 
                          id="description" 
                          name="description" 
                          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                          value={courseForm.description} 
                          onChange={handleCourseFormChange} 
                          required 
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
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ProtectedRoute>
  )
}