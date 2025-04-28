"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  Download, 
  Edit, 
  FileText, 
  Pencil, 
  Plus, 
  Trash2, 
  Upload, 
  Users,
  X 
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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
  const [students, setStudents] = useState<User[]>([])
  const [availableStudents, setAvailableStudents] = useState<User[]>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [showAddMaterialForm, setShowAddMaterialForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null)
  const [materialForm, setMaterialForm] = useState({
    title: "",
    description: "",
    file: null as File | null
  })
  const [isEditMode, setIsEditMode] = useState(false)

  // Cargar datos del curso
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUserRole(userData.role)
      setUserId(userData.id)
    }
    fetchCourse()
    if (id) {
      fetchMaterials()
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
        return
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
          return
        }
        throw new Error('Error al cargar el curso')
      }

      const data = await response.json()
      if (data.success) {
        setCourse(data.course)
        
        // Si es profesor o admin, cargar la lista de estudiantes disponibles
        if (userRole === 'admin' || userRole === 'teacher') {
          fetchAvailableStudents()
        }
      } else {
        toast.error('Error', {
          description: data.message || 'Error al cargar el curso'
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    } finally {
      setLoading(false)
    }
  }

  // Obtener estudiantes disponibles (que no están inscritos en el curso)
  const fetchAvailableStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/users?role=student', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success && course) {
        // Filtrar estudiantes que ya están en el curso
        const enrolledIds = course.students.map((student: User) => student._id)
        const available = data.users.filter((user: User) => 
          !enrolledIds.includes(user._id) && user.role === 'student'
        )
        setAvailableStudents(available)
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error)
    }
  }

  // Inscribir estudiante en el curso
  const handleEnrollStudent = async () => {
    if (!selectedStudent) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/courses/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId: selectedStudent })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Estudiante inscrito', {
          description: 'El estudiante ha sido inscrito exitosamente'
        })
        fetchCourse() // Recargar datos del curso
        setSelectedStudent("")
      } else {
        toast.error('Error', {
          description: data.message || 'Error al inscribir al estudiante'
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  // Eliminar estudiante del curso
  const handleRemoveStudent = async (studentId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/courses/${id}/students`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Estudiante eliminado', {
          description: 'El estudiante ha sido eliminado del curso exitosamente'
        })
        fetchCourse() // Recargar datos del curso
      } else {
        toast.error('Error', {
          description: data.message || 'Error al eliminar al estudiante'
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  // Obtener materiales del curso
  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/courses/${id}/materials`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMaterials(data.materials)
        }
      } else {
        // Si la ruta no existe, simplemente iniciamos con un array vacío
        // ya que esta funcionalidad podría no estar implementada aún
        setMaterials([])
      }
    } catch (error) {
      console.error('Error al cargar materiales:', error)
      setMaterials([])
    }
  }

  // Manejar cambios en el formulario de material
  const handleMaterialFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setMaterialForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Manejar selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMaterialForm(prev => ({
        ...prev,
        file: e.target.files![0]
      }))
    }
  }

  // Preparar formulario para editar material
  const prepareEditMaterial = (material: CourseMaterial) => {
    setIsEditMode(true)
    setEditingMaterial(material)
    setMaterialForm({
      title: material.title,
      description: material.description || '',
      file: null
    })
    setShowAddMaterialForm(true)
  }

  // Cancelar edición o creación de material
  const cancelMaterialForm = () => {
    setIsEditMode(false)
    setEditingMaterial(null)
    setMaterialForm({
      title: "",
      description: "",
      file: null
    })
    setShowAddMaterialForm(false)
  }

  // Subir material al curso
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!materialForm.title) {
      toast.error('Datos incompletos', {
        description: 'Por favor, completa el título del material'
      })
      return
    }

    // En modo edición, no es obligatorio un nuevo archivo
    if (!isEditMode && !materialForm.file) {
      toast.error('Datos incompletos', {
        description: 'Por favor, selecciona un archivo para subir'
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append('title', materialForm.title)
      formData.append('description', materialForm.description)
      if (materialForm.file) {
        formData.append('file', materialForm.file)
      }

      let url = `http://localhost:5000/api/courses/${id}/materials`
      let method = 'POST'

      // Si estamos en modo edición, usar PUT y la URL correcta
      if (isEditMode && editingMaterial) {
        url = `http://localhost:5000/api/courses/${id}/materials/${editingMaterial._id}`
        method = 'PUT'
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      // Verificar respuesta
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success(isEditMode ? 'Material actualizado' : 'Material subido', {
            description: isEditMode 
              ? 'El material ha sido actualizado exitosamente'
              : 'El material ha sido subido exitosamente'
          })
          fetchMaterials() // Recargar materiales
          setMaterialForm({
            title: "",
            description: "",
            file: null
          })
          setShowAddMaterialForm(false)
          setIsEditMode(false)
          setEditingMaterial(null)
        } else {
          toast.error('Error', {
            description: data.message || 'Error al procesar el material'
          })
        }
      } else {
        // Si la API no está lista, mostrar una notificación amigable
        toast.info('Funcionalidad en desarrollo', {
          description: 'La funcionalidad para gestionar materiales está en desarrollo'
        })
        // Simular éxito para demostración
        setShowAddMaterialForm(false)
        setMaterialForm({
          title: "",
          description: "",
          file: null
        })
        setIsEditMode(false)
        setEditingMaterial(null)
      }
    } catch (error) {
      console.error('Error al procesar material:', error)
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  // Eliminar material del curso
  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/courses/${id}/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success('Material eliminado', {
            description: 'El material ha sido eliminado exitosamente'
          })
          fetchMaterials() // Recargar materiales
        } else {
          toast.error('Error', {
            description: data.message || 'Error al eliminar el material'
          })
        }
      } else {
        // Si la API no está lista, mostrar una notificación amigable
        toast.info('Funcionalidad en desarrollo', {
          description: 'La funcionalidad para eliminar materiales está en desarrollo'
        })
        // Simular éxito para demostración (eliminando el material del estado)
        setMaterials(prev => prev.filter(m => m._id !== materialId))
      }
    } catch (error) {
      console.error('Error al eliminar material:', error)
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  // Filtrar estudiantes por término de búsqueda
  const filteredStudents = course?.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

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

              {course.schedule && (
                <div>
                  <h3 className="font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Horario
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {course.schedule.days.join(', ')} de {course.schedule.startTime} a {course.schedule.endTime}
                  </p>
                </div>
              )}
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

        {/* Pestañas: Estudiantes y Materiales */}
        <Tabs defaultValue="materials" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="materials">Materiales</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
          </TabsList>

          {/* Pestaña de Materiales */}
          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Materiales del curso</CardTitle>
                  <CardDescription>
                    Recursos y material didáctico para este curso
                  </CardDescription>
                </div>
                {(userRole === 'admin' || userRole === 'teacher') && (
                  <Button onClick={() => {
                    if (showAddMaterialForm) {
                      cancelMaterialForm()
                    } else {
                      setShowAddMaterialForm(true)
                      setIsEditMode(false)
                    }
                  }}>
                    {showAddMaterialForm ? 'Cancelar' : 'Agregar material'}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulario para agregar/editar material */}
                {showAddMaterialForm && (
                  <Card className="border border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {isEditMode ? 'Editar material' : 'Agregar nuevo material'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleUploadMaterial} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
                          <Input
                            id="title"
                            name="title"
                            value={materialForm.title}
                            onChange={handleMaterialFormChange}
                            placeholder="Título del material"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={materialForm.description}
                            onChange={handleMaterialFormChange}
                            placeholder="Descripción del material"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="file">
                            {isEditMode ? 'Archivo (opcional)' : 'Archivo'} 
                            {!isEditMode && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="file"
                            type="file"
                            onChange={handleFileChange}
                            required={!isEditMode}
                          />
                          {isEditMode && (
                            <p className="text-xs text-gray-500 mt-1">
                              Si no selecciona un nuevo archivo, se mantendrá el archivo actual.
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            {isEditMode ? (
                              <>
                                <Pencil className="w-4 h-4 mr-2" /> Actualizar material
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" /> Subir material
                              </>
                            )}
                          </Button>
                          <Button type="button" variant="outline" onClick={cancelMaterialForm}>
                            <X className="w-4 h-4 mr-2" /> Cancelar
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de materiales */}
                {materials.length > 0 ? (
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <Card key={material._id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{material.title}</CardTitle>
                            {(userRole === 'admin' || userRole === 'teacher') && (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600"
                                  onClick={() => prepareEditMaterial(material)}
                                >
                                  <span className="sr-only">Editar</span>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600"
                                    >
                                      <span className="sr-only">Eliminar</span>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        ¿Estás seguro de eliminar este material?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Eliminarás permanentemente este material del curso.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={() => handleDeleteMaterial(material._id)}
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                          <CardDescription>
                            Subido por {material.uploadedBy?.name || 'Usuario'} el{' '}
                            {new Date(material.uploadedAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {material.description && (
                            <p className="text-sm text-gray-600 mb-4">{material.description}</p>
                          )}
                          <div className="text-sm text-gray-500">
                            <p>Nombre: {material.fileName}</p>
                            <p>Tamaño: {(material.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t">
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => window.open(material.fileUrl, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" /> Descargar material
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-500">No hay materiales disponibles</p>
                    <p className="text-sm text-gray-400">
                      {userRole === 'admin' || userRole === 'teacher'
                        ? 'Comienza agregando material para este curso'
                        : 'El instructor aún no ha agregado materiales'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Estudiantes */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estudiantes inscritos</CardTitle>
                <CardDescription>
                  Estudiantes que participan en este curso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Buscador de estudiantes */}
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Buscar por nombre o correo"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Formulario para inscribir estudiantes (solo para profesores y admin) */}
                {(userRole === 'admin' || userRole === 'teacher') && (
                  <Card className="border border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Inscribir estudiante</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label htmlFor="studentId" className="mb-2 block">Estudiante</Label>
                          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estudiante" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStudents.map((student) => (
                                <SelectItem key={student._id} value={student._id}>
                                  {student.name} ({student.email})
                                </SelectItem>
                              ))}
                              {availableStudents.length === 0 && (
                                <SelectItem value="none" disabled>
                                  No hay estudiantes disponibles
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={handleEnrollStudent} 
                          disabled={!selectedStudent || availableStudents.length === 0}
                        >
                          <Plus className="w-4 h-4 mr-2" /> Inscribir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de estudiantes */}
                {filteredStudents.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Correo
                          </th>
                          {(userRole === 'admin' || userRole === 'teacher') && (
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                          <tr key={student._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.username}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{student.email}</div>
                            </td>
                            {(userRole === 'admin' || userRole === 'teacher') && (
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                  onClick={() => handleRemoveStudent(student._id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Eliminar
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-500">No hay estudiantes inscritos</p>
                    <p className="text-sm text-gray-400">
                      {searchTerm 
                        ? 'No se encontraron estudiantes con ese criterio de búsqueda' 
                        : userRole === 'admin' || userRole === 'teacher'
                          ? 'Comienza inscribiendo estudiantes en este curso'
                          : 'Aún no hay estudiantes inscritos en este curso'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}