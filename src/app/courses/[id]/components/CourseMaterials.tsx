"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { FileText, Pencil, Plus, Trash2, Upload } from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  username: string
  role: string
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

interface CourseMaterialsProps {
  courseId: string
  materials: CourseMaterial[]
  userRole: string | null
  fetchMaterials: () => Promise<void>
}

export default function CourseMaterials({ courseId, materials, userRole, fetchMaterials }: CourseMaterialsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isAddingMaterial, setIsAddingMaterial] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  
  // Estados para la edición de materiales
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editFile, setEditFile] = useState<File | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Verificar si el usuario realmente tiene permisos para administrar materiales
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

  // Filtrar materiales por término de búsqueda
  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar cambio de archivo seleccionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Manejar cambio de archivo en la edición
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditFile(e.target.files[0])
    }
  }

  // Abrir modal de edición
  const openEditDialog = (material: CourseMaterial) => {
    setEditingMaterial(material)
    setEditTitle(material.title)
    setEditDescription(material.description || '')
    setEditFile(null)
    setEditDialogOpen(true)
  }

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Obtener icono según tipo de archivo
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('presentation')) return '📽️'
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️'
    return '📁'
  }

  // Subir material del curso
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !selectedFile || !hasPermission) {
      toast.error('Datos incompletos', {
        description: 'Por favor completa todos los campos y selecciona un archivo'
      })
      return
    }

    try {
      setIsUploading(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('file', selectedFile)

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/materials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Material subido', {
          description: 'El material ha sido subido exitosamente'
        })
        setTitle('')
        setDescription('')
        setSelectedFile(null)
        setIsUploading(false)
        setIsAddingMaterial(false)
        
        // Resetear el input de archivo
        const fileInput = document.getElementById('fileInput') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        fetchMaterials() // Recargar materiales
      } else {
        toast.error('Error', {
          description: data.message || 'Error al subir el material'
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Guardar cambios en el material
  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editTitle || !editingMaterial || !hasPermission) {
      toast.error('Datos incompletos', {
        description: 'Por favor completa al menos el título del material'
      })
      return
    }

    try {
      setIsUpdating(true)
      const token = localStorage.getItem('token')
      if (!token) return

      const formData = new FormData()
      formData.append('title', editTitle)
      formData.append('description', editDescription)
      
      // Solo añadir archivo si se ha seleccionado uno nuevo
      if (editFile) {
        formData.append('file', editFile)
      }

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/materials/${editingMaterial._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Material actualizado', {
          description: 'El material ha sido actualizado exitosamente'
        })
        setEditDialogOpen(false)
        setEditingMaterial(null)
        setEditTitle('')
        setEditDescription('')
        setEditFile(null)
        
        fetchMaterials() // Recargar materiales
      } else {
        toast.error('Error', {
          description: data.message || 'Error al actualizar el material'
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Eliminar material
  const handleDeleteMaterial = async (materialId: string) => {
    if (!hasPermission) return
    
    if (!confirm('¿Estás seguro de que deseas eliminar este material? Esta acción no se puede deshacer.')) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

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
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Materiales del Curso</CardTitle>
          <CardDescription>
            Recursos y documentos compartidos para este curso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buscador de materiales */}
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar por título o descripción"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Formulario para subir materiales (solo para profesores y administradores) */}
          {hasPermission && (
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Subir nuevo material</CardTitle>
                <Button 
                  onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                  variant="outline"
                >
                  {isAddingMaterial ? "Cancelar" : "Subir nuevo material"}
                </Button>
              </CardHeader>
              <CardContent>
                {isAddingMaterial ? (
                  <form onSubmit={handleUploadMaterial} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Título
                      </label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nombre del material"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Descripción
                      </label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Breve descripción (opcional)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="fileInput" className="text-sm font-medium">
                        Archivo
                      </label>
                      <Input
                        id="fileInput"
                        type="file"
                        onChange={handleFileChange}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Tamaño máximo: 25MB. Formatos permitidos: PDF, Word, Excel, PowerPoint, imágenes, ZIP
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isUploading || !title || !selectedFile}
                    >
                      {isUploading ? (
                        <>Subiendo...</>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Subir Material
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-lg font-medium text-gray-600">
                        Comparte materiales con los estudiantes
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        Haz clic en "Subir nuevo material" para compartir documentos, presentaciones o archivos
                      </p>
                      <Button onClick={() => setIsAddingMaterial(true)}>
                        <Upload className="w-4 h-4 mr-2" /> Subir nuevo material
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lista de materiales */}
          {filteredMaterials.length > 0 ? (
            <div className="space-y-4">
              {filteredMaterials.map((material) => (
                <Card key={material._id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex items-start p-4">
                    <div className="text-4xl mr-4">
                      {getFileIcon(material.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold truncate">
                          {material.title}
                        </h3>
                        <div className="flex items-center">
                          <a 
                            href={`http://localhost:5000${material.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 rounded-md px-2 py-1 text-sm"
                          >
                            Descargar
                          </a>
                          {hasPermission && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-auto text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                onClick={() => openEditDialog(material)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                onClick={() => handleDeleteMaterial(material._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {material.description || "Sin descripción"}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <span>
                          {formatFileSize(material.fileSize)} • Subido por {material.uploadedBy.name} • {new Date(material.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-500">No hay materiales disponibles</p>
              <p className="text-sm text-gray-400">
                {searchTerm 
                  ? 'No se encontraron materiales con ese criterio de búsqueda' 
                  : hasPermission
                    ? 'Comienza subiendo materiales para este curso'
                    : 'Aún no hay materiales disponibles para este curso'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de edición de material */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Material</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateMaterial} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Título</Label>
              <Input
                id="editTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Nombre del material"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editDescription">Descripción</Label>
              <Textarea
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Breve descripción (opcional)"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editFileInput">
                Reemplazar archivo (opcional)
              </Label>
              <Input
                id="editFileInput"
                type="file"
                onChange={handleEditFileChange}
              />
              {editingMaterial && (
                <p className="text-xs text-gray-500">
                  Archivo actual: {editingMaterial.fileName} ({formatFileSize(editingMaterial.fileSize)})
                </p>
              )}
              <p className="text-xs text-gray-500">
                Solo seleccione un archivo si desea reemplazar el actual
              </p>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isUpdating || !editTitle}>
                {isUpdating ? "Actualizando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}