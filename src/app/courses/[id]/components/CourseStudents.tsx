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
  const [availableStudents, setAvailableStudents] = useState<User[]>([])
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
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

  // Filtrar estudiantes disponibles por término de búsqueda
  const filteredAvailableStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(studentSearchTerm.toLowerCase())
  )

  // Obtener estudiantes disponibles (que no están inscritos en el curso)
  const fetchAvailableStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      setIsEnrollingStudent(true)
      const response = await fetch('http://localhost:5000/api/users?role=student', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        // Filtrar estudiantes que ya están en el curso
        const enrolledIds = students.map((student: User) => student._id)
        const available = data.users.filter((user: User) => 
          !enrolledIds.includes(user._id) && user.role === 'student'
        )
        setAvailableStudents(available)
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error)
      toast.error('Error al cargar estudiantes', {
        description: 'No se pudieron obtener los estudiantes disponibles'
      })
    }
  }

  // Inscribir estudiante en el curso
  const handleEnrollStudent = async () => {
    if (!selectedStudent || !hasPermission) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
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
                  if (isEnrollingStudent) {
                    setIsEnrollingStudent(false)
                  } else {
                    fetchAvailableStudents()
                  }
                }}
                variant="outline"
              >
                {isEnrollingStudent ? "Cancelar" : "Buscar estudiantes"}
              </Button>
            </CardHeader>
            <CardContent>
              {isEnrollingStudent ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Buscar estudiantes por nombre, usuario o correo"
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  
                  {filteredAvailableStudents.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
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
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredAvailableStudents.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.username}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    setSelectedStudent(student._id)
                                    handleEnrollStudent()
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Inscribir
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-lg font-medium text-gray-500">
                        {studentSearchTerm 
                          ? 'No se encontraron estudiantes con ese criterio' 
                          : 'No hay estudiantes disponibles para inscribir'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {studentSearchTerm 
                          ? 'Intenta con otro término de búsqueda' 
                          : 'Todos los estudiantes ya están inscritos o no hay estudiantes registrados'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-600">
                      Busca estudiantes para inscribir
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Haz clic en "Buscar estudiantes" para ver los estudiantes disponibles
                    </p>
                    <Button onClick={fetchAvailableStudents}>
                      <Users className="w-4 h-4 mr-2" /> Buscar estudiantes
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