'use client'

import { useState, useEffect } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import AdminNav from '@/components/admin/admin-nav'
import ProtectedRoute from '@/components/protected-route'
import { API_BASE_URL } from '@/lib/utils'

const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

interface NewsItem {
  _id: string
  title: string
  content: string
  image: string | null
  isPublished: boolean
  isVisible: boolean
  author: {
    _id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function NewsAdminPage() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  
  // Estado para la noticia que se está editando
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  
  // Estado para el formulario de creación/edición
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    isVisible: false,
  });

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState('list');
  
  // Estado para rastrear la carga de imágenes
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Comprobar si el usuario está autenticado como administrador
    const storedToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!storedToken || !userData) {
      router.push('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      
      // Verificar si es administrador
      if (parsedUser.role !== 'admin') {
        toast.error('Acceso restringido. Solo administradores pueden acceder a esta página.');
        router.push('/dashboard');
        return;
      }
      
      setToken(storedToken);
      
      // Cargar noticias
      loadNews(storedToken);
    } catch (error) {
      console.error('Error al procesar datos de usuario:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    }
  }, [router]);

  // Cargar todas las noticias
  const loadNews = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar noticias');
      }
      
      const data = await response.json();
      setNews(data.news);
    } catch (error) {
      console.error('Error al cargar noticias:', error);
      toast.error('Error al cargar noticias');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Manejar cambios en el editor de texto
  const handleEditorChange = (content: string) => {
    setFormData({
      ...formData,
      content
    });
  };

  // Función para subir imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // Crear un FormData para enviar la imagen
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al subir imagen');
      }
      
      const data = await response.json();
      
      // Actualizar el estado con la URL de la imagen
      setFormData(prev => ({
        ...prev,
        image: data.imageUrl
      }));
      
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  // Crear o actualizar noticia
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingNews 
        ? `${API_BASE_URL}/api/news/${editingNews._id}` 
        : `${API_BASE_URL}/api/news`;
      
      const method = editingNews ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar la noticia');
      }
      
      toast.success(editingNews ? 'Noticia actualizada correctamente' : 'Noticia creada correctamente');
      
      // Reiniciar el formulario y cambiar a la pestaña de lista
      resetForm();
      setActiveTab('list');
      
      // Recargar noticias
      loadNews(token);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al guardar la noticia');
    }
  };

  // Cambiar visibilidad de noticia
  const toggleVisibility = async (newsId: string, makeVisible: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/${newsId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVisible: makeVisible })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar visibilidad');
      }
      
      toast.success(`La noticia ahora está ${makeVisible ? 'visible' : 'oculta'}`);
      
      // Recargar noticias
      loadNews(token);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al cambiar la visibilidad');
    }
  };

  // Eliminar noticia
  const deleteNews = async (newsId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta noticia? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/${newsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar noticia');
      }
      
      toast.success('Noticia eliminada correctamente');
      
      // Recargar noticias
      loadNews(token);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al eliminar la noticia');
    }
  };

  // Editar noticia
  const handleEdit = (news: NewsItem) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      content: news.content,
      image: news.image || '',
      isVisible: news.isVisible
    });
    setActiveTab('create');
  };

  // Reiniciar formulario
  const resetForm = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      content: '',
      image: '',
      isVisible: false
    });
  };

  // Si está cargando, mostrar indicador de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="space-y-6">
        {/* Componente de navegación compartido */}
        <AdminNav />

        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Listado de Noticias</TabsTrigger>
              <TabsTrigger value="create">{editingNews ? 'Editar Noticia' : 'Crear Noticia'}</TabsTrigger>
            </TabsList>
            
            {/* Listado de Noticias */}
            <TabsContent value="list" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Noticias Existentes</h2>
                <Button 
                  onClick={() => {
                    resetForm();
                    setActiveTab('create');
                  }}
                >
                  Crear Nueva Noticia
                </Button>
              </div>
              
              {news.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No hay noticias disponibles</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {news.map((item) => (
                    <Card key={item._id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{item.title}</CardTitle>
                            <CardDescription>
                              Creada: {new Date(item.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex space-x-1">
                            {item.isVisible && (
                              <Badge className="bg-green-500">Visible</Badge>
                            )}
                            {!item.isVisible && (
                              <Badge variant="outline">Oculta</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                          {item.image && (
                            <div className="w-full md:w-1/4">
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="rounded-md w-full h-32 object-cover"
                              />
                            </div>
                          )}
                          <div className={`w-full ${item.image ? 'md:w-3/4' : ''}`}>
                            <div 
                              className="text-sm prose max-w-none line-clamp-3" 
                              dangerouslySetInnerHTML={{ __html: item.content }}
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          Autor: {item.author?.name}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleVisibility(item._id, !item.isVisible)}
                            title={item.isVisible ? "Ocultar noticia" : "Hacer visible"}
                          >
                            {item.isVisible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            onClick={() => deleteNews(item._id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Formulario de Crear/Editar */}
            <TabsContent value="create">
              <Card>
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle>{editingNews ? 'Editar Noticia' : 'Crear Nueva Noticia'}</CardTitle>
                    <CardDescription>
                      Completa el formulario para {editingNews ? 'actualizar la' : 'crear una nueva'} noticia
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input 
                        id="title" 
                        name="title" 
                        placeholder="Título de la noticia" 
                        value={formData.title} 
                        onChange={handleInputChange} 
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">Contenido</Label>
                      <Editor
                        id="content"
                        apiKey={TINYMCE_API_KEY}
                        init={{
                          height: 300,
                          menubar: false,
                          plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                          ],
                          toolbar: 'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help',
                          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                        }}
                        value={formData.content}
                        onEditorChange={handleEditorChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="image">Imagen</Label>
                      <Input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={isUploading}
                      />
                      {formData.image && (
                        <div className="mt-2">
                          <img 
                            src={formData.image} 
                            alt="Vista previa" 
                            className="max-h-40 rounded-md"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isVisible"
                        name="isVisible"
                        className="rounded"
                        checked={formData.isVisible}
                        onChange={handleInputChange}
                      />
                      <Label htmlFor="isVisible">Mostrar en el Dashboard</Label>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => {
                      resetForm();
                      setActiveTab('list');
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingNews ? 'Actualizar Noticia' : 'Crear Noticia'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}