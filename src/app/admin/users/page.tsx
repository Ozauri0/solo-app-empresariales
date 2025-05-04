'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/lib/utils'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import ProtectedRoute from '@/components/protected-route'

// Icons
import { 
  AlertCircle, 
  PencilIcon, 
  Search, 
  TrashIcon, 
  UserIcon, 
  PlusCircle,
  X 
} from 'lucide-react'

// Interfaces para tipado
interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  rut?: string;
  program?: string;
}

export default function UsersAdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Estado para manejo de modales
  const [showUserModal, setShowUserModal] = useState(false)
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

  // Cargar datos al iniciar la página
  useEffect(() => {
    fetchUsers()
  }, [])

  // Función para obtener todos los usuarios
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
    } finally {
      setLoading(false)
    }
  }

  // Función para crear/actualizar usuario
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      let url = `${API_BASE_URL}/api/users`
      let method = 'POST'
      
      if (editMode && selectedItem) {
        url = `${API_BASE_URL}/api/users/${selectedItem._id}`
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

  // Función para eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
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

  // Manejar cambios en formulario de usuario
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'rut') {
      // Eliminar todos los caracteres no numéricos
      const numericValue = value.replace(/\D/g, '')
      
      // Aplicar formato solo si hay contenido
      if (numericValue) {
        // Formatear RUT (ej: 123456789 -> 12.345.678-9)
        setUserForm(prev => ({
          ...prev,
          rut: formatRut(numericValue)
        }))
      } else {
        // Si está vacío, limpiarlo
        setUserForm(prev => ({
          ...prev,
          rut: ''
        }))
      }
    } else if (name === 'email') {
      // Si cambia el email, actualizar también el username
      setUserForm(prev => ({
        ...prev,
        [name]: value,
        username: value // El username será igual al email
      }))
    } else {
      // Para el resto de los campos, comportamiento normal
      setUserForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Función para formatear RUT (ej: 123456789 -> 12.345.678-9)
  const formatRut = (rut: string) => {
    // Obtener dígito verificador
    const dv = rut.slice(-1)
    // Obtener el cuerpo del RUT sin el dígito verificador
    let rutBody = rut.slice(0, -1)
    
    // Formatear con puntos
    let formattedRut = ''
    for (let i = rutBody.length - 1, j = 0; i >= 0; i--, j++) {
      formattedRut = rutBody.charAt(i) + formattedRut
      if (j === 2 && i !== 0) {
        formattedRut = '.' + formattedRut
        j = -1
      }
    }
    
    // Retornar RUT con formato completo
    return `${formattedRut}-${dv}`
  }

  // Filtrar usuarios según término de búsqueda
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rut?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>Administra los usuarios registrados en el sistema</CardDescription>
              </div>
              <Button onClick={() => {
                resetUserForm()
                setEditMode(false)
                setShowUserModal(true)
              }}>
                <PlusCircle className="mr-2 h-4 w-4" />
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
                    placeholder="Buscar por nombre, correo o RUT..."
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
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
                              <div className="text-sm text-gray-900">
                                {user.role === 'admin' ? 'Administrador' : 
                                 user.role === 'teacher' ? 'Profesor' : 'Estudiante'}
                              </div>
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
                          <td colSpan={4} className="px-6 py-4 text-center">
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
                  <p className="text-xs text-muted-foreground">
                    Este correo se usará también como nombre de usuario
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {editMode ? 'Contraseña (dejar en blanco para mantener)' : 'Contraseña'}
                  </Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    value={userForm.password} 
                    onChange={handleUserFormChange} 
                    required={!editMode} 
                  />
                </div>
                
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
                  <p className="text-xs text-muted-foreground">
                    Ingrese solo números (ej: 123456789)
                  </p>
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
      </div>
    </ProtectedRoute>
  )
}