"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, Plus, Trash2 } from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  username: string
  role: string
}

interface CourseStudentsProps {
  courseId: string
  students: User[]
  userRole: string | null
  fetchCourse: () => Promise<void>
}

export default function CourseStudents({ courseId, students, userRole, fetchCourse }: CourseStudentsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isEnrollingStudent, setIsEnrollingStudent] = useState(false)
  const [studentSearchEmail, setStudentSearchEmail] = useState("")
  const [studentPreview, setStudentPreview] = useState<User | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  // Verificar si el usuario realmente tiene permisos para administrar estudiantes
  useEffect(() => {
    const verifyPermissions = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()
        
        if (response.ok && data.success) {
          // Obtener el ID del usuario actual del localStorage
          const userData = localStorage.getItem('user')
          if (!userData) return
          
          const user = JSON.parse(userData)
          const userId = user.id
          
          // Verificar si el usuario es admin o el instructor del curso
          const isAdmin = userRole === 'admin'
          const isInstructor = data.course.instructor && 
                              data.course.instructor._id === userId
          
          setHasPermission(isAdmin || isInstructor)
        } else {
          setHasPermission(false)
        }
      } catch (error) {
        console.error('Error al verificar permisos:', error)
        setHasPermission(false)
      }
    }

    verifyPermissions()
  }, [courseId, userRole])

  // Filtrar estudiantes por término de búsqueda
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Buscar estudiante por correo electrónico
  const searchStudentByEmail = async () => {
    if (!studentSearchEmail.trim()) {
      toast.error('Campo requerido', {
        description: 'Ingresa un correo electrónico para buscar'
      })
      return
    }
    
    try {
      setIsSearching(true)
      setStudentPreview(null)
      
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/users/search?email=${encodeURIComponent(studentSearchEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // Verificar si el estudiante ya está inscrito en el curso
        const isAlreadyEnrolled = students.some(student => student._id === data.user._id)
        
        if (isAlreadyEnrolled) {
          toast.info('Estudiante ya inscrito', {
            description: 'Este estudiante ya está inscrito en el curso'
          })
        } else {
          setStudentPreview(data.user)
        }
      } else {
        toast.error('Usuario no encontrado', {
          description: 'No se encontró ningún usuario con ese correo electrónico'
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Inscribir al estudiante previamente buscado
  const handleEnrollFoundStudent = async () => {
    if (!studentPreview || !hasPermission) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId: studentPreview._id })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Estudiante inscrito', {
          description: 'El estudiante ha sido inscrito exitosamente'
        })
        fetchCourse() // Recargar datos del curso
        setStudentPreview(null)
        setStudentSearchEmail("")
        setIsEnrollingStudent(false)
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
    if (!hasPermission) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/students`, {
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

  return (
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

        {/* Formulario para inscribir estudiantes (solo si tiene permisos verificados) */}
        {hasPermission && (
          <Card className="border border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Inscribir estudiante</CardTitle>
              <Button 
                onClick={() => {
                  setIsEnrollingStudent(!isEnrollingStudent)
                  setStudentPreview(null)
                  setStudentSearchEmail("")
                }}
                variant="outline"
              >
                {isEnrollingStudent ? "Cancelar" : "Inscribir estudiante"}
              </Button>
            </CardHeader>
            <CardContent>
              {isEnrollingStudent ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Buscar estudiante por correo electrónico"
                      value={studentSearchEmail}
                      onChange={(e) => setStudentSearchEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={searchStudentByEmail}
                      disabled={isSearching}
                    >
                      {isSearching ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                  
                  {studentPreview ? (
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
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{studentPreview.name}</div>
                              <div className="text-sm text-gray-500">{studentPreview.username}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{studentPreview.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={handleEnrollFoundStudent}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Inscribir
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : isSearching ? (
                    <div className="text-center py-12 border rounded-lg">
                      <div className="w-10 h-10 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-lg font-medium text-gray-500">Buscando estudiante...</p>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-lg font-medium text-gray-500">
                        {studentSearchEmail.trim()
                          ? 'No se encontró ningún estudiante con ese correo'
                          : 'Ingresa un correo electrónico para buscar un estudiante'}
                      </p>
                      <p className="text-sm text-gray-400">
                        Los estudiantes deben estar registrados en el sistema
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-600">
                      Inscribe estudiantes en este curso
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Busca estudiantes por su correo electrónico para inscribirlos
                    </p>
                    <Button onClick={() => setIsEnrollingStudent(true)}>
                      <Users className="w-4 h-4 mr-2" /> Inscribir estudiante
                    </Button>
                  </div>
                </div>
              )}
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
                  {hasPermission && (
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
                    {hasPermission && (
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
                : hasPermission
                  ? 'Comienza inscribiendo estudiantes en este curso'
                  : 'Aún no hay estudiantes inscritos en este curso'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}