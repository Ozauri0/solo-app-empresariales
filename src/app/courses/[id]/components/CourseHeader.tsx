"use client"

import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Upload } from "lucide-react"

interface CourseHeaderProps {
  course: {
    _id: string
    title: string
    code: string
    image?: string
    instructor?: {
      _id: string
      name: string
    }
  }
  isOwnerOrAdmin: boolean
  onCourseUpdated: () => Promise<void>
}

export default function CourseHeader({ course, isOwnerOrAdmin, onCourseUpdated }: CourseHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState(course.title)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Función para actualizar el título del curso
  const updateCourseTitle = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Error de autenticación', {
          description: 'Por favor, inicia sesión de nuevo'
        })
        return
      }

      const response = await fetch(`http://localhost:5000/api/courses/${course._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Título actualizado', {
          description: 'El título del curso ha sido actualizado exitosamente'
        })
        await onCourseUpdated()
        setIsEditingTitle(false)
      } else {
        toast.error('Error', {
          description: data.message || 'Error al actualizar el título del curso'
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  // Función para subir una nueva imagen del curso
  const uploadCourseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('image', file)

    try {
      setIsUploading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Error de autenticación', {
          description: 'Por favor, inicia sesión de nuevo'
        })
        return
      }

      const response = await fetch(`http://localhost:5000/api/courses/${course._id}/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Imagen actualizada', {
          description: 'La imagen del curso ha sido actualizada exitosamente'
        })
        await onCourseUpdated()
      } else {
        toast.error('Error', {
          description: data.message || 'Error al actualizar la imagen del curso'
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

  // Función para eliminar la imagen actual
  const deleteImage = async () => {
    try {
      setIsDeleting(true)
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Error de autenticación', {
          description: 'Por favor, inicia sesión de nuevo'
        })
        return
      }

      // Usar una ruta específica para eliminar la imagen del curso
      const response = await fetch(`http://localhost:5000/api/courses/${course._id}/image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Imagen eliminada', {
          description: 'La imagen del curso ha sido eliminada'
        })
        await onCourseUpdated()
      } else {
        toast.error('Error', {
          description: data.message || 'Error al eliminar la imagen del curso'
        })
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner de imagen del curso */}
      <div className="relative w-full h-60 rounded-lg overflow-hidden mb-6">
        <Image
          src={course.image || '/placeholder.svg?height=300&width=1000'}
          alt={course.title}
          width={1280}
          height={360}
          className="object-cover w-full h-full"
          style={{
            objectPosition: 'center'
          }}
          priority
        />
        
        {/* Controles de imagen (solo visibles para admin/instructor) */}
        {isOwnerOrAdmin && (
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white text-black hover:bg-slate-100"
                onClick={() => document.getElementById('imageUpload')?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Subiendo...' : 'Cambiar imagen'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white text-red-500 hover:bg-red-50"
                onClick={deleteImage}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Eliminando...' : 'Eliminar imagen'}
              </Button>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={uploadCourseImage}
              />
            </div>
          </div>
        )}
        
        {/* Información principal del curso sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex justify-between items-center">
            <div>
              {isEditingTitle ? (
                <div className="space-y-2">
                  <Input 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-xl font-bold w-full max-w-md bg-white/90"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={updateCourseTitle}
                      disabled={!newTitle.trim() || newTitle === course.title}
                      className="bg-white text-black hover:bg-slate-100"
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outline" 
                      onClick={() => {
                        setNewTitle(course.title)
                        setIsEditingTitle(false)
                      }}
                      className="bg-white/80 text-black hover:bg-white"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{course.title}</h1>
                  {isOwnerOrAdmin && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar título</span>
                    </Button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-white/20 text-white border-white/40">{course.code}</Badge>
                <p className="text-sm text-white/80">
                  Instructor: {course.instructor?.name || 'No asignado'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explicación para usuarios no admin/teacher */}
      {!isOwnerOrAdmin && (
        <p className="text-sm text-muted-foreground italic">
          Solo los administradores y profesores pueden modificar la información del curso.
        </p>
      )}
    </div>
  )
}