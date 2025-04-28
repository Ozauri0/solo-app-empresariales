import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationProps {
  _id: string;
  title: string;
  message: string;
  sender: {
    _id: string;
    name: string;
  };
  createdAt: string;
  isRead: boolean;
}

interface CourseAlertsProps {
  courseId: string;
}

const CourseAlerts: React.FC<CourseAlertsProps> = ({ courseId }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCourseInstructor, setIsCourseInstructor] = useState(false);
  
  // Estados para el modal de edición
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationProps | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');

  // Verificar si el usuario es administrador general
  const isAdmin = user?.role === 'admin';
  
  // Ahora verificamos los permisos combinando el rol y la relación con el curso específico
  const canCreateAlert = isAdmin || isCourseInstructor;
  const canManageNotifications = isAdmin || isCourseInstructor;

  // Verificar si el usuario es instructor del curso específico
  const checkIfCourseInstructor = async () => {
    if (!courseId || !token || !user) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener información del curso');
      }

      const courseData = await response.json();
      console.log('[CourseAlerts] Datos del curso:', courseData);
      
      // Corregir la navegación del objeto para acceder al instructor correctamente
      // La API devuelve {success: true, course: {...}} 
      const course = courseData.course || courseData;
      
      // Extraer los IDs para comparar
      const userId = user.id;
      // Dependiendo de la estructura, el instructor podría ser un objeto o directamente el ID
      const instructorId = course.instructor?._id || course.instructor;
      
      // Verificar si el usuario es el instructor de este curso específico
      const isInstructor = instructorId && userId && instructorId.toString() === userId.toString();
      
      console.log('[CourseAlerts] Estructura del curso:', course);
      console.log('[CourseAlerts] ID del instructor:', instructorId);
      console.log('[CourseAlerts] ID del usuario:', userId);
      console.log('[CourseAlerts] ¿Es instructor del curso?', isInstructor);
      
      setIsCourseInstructor(!!isInstructor); // Convertir a booleano para manejar undefined
    } catch (err: any) {
      console.error('[CourseAlerts] Error al verificar instructor:', err.message);
    }
  };

  // Cargar notificaciones
  const fetchNotifications = async () => {
    // No retornamos si isLoading es true en la primera carga
    console.log(`[CourseAlerts] Solicitando notificaciones para el curso: ${courseId}`);    
    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[CourseAlerts] Error al cargar notificaciones:`, errorData);
        throw new Error('Error al cargar las alertas');
      }

      const data = await response.json();
      console.log(`[CourseAlerts] Notificaciones recibidas:`, data);
      setNotifications(data);
    } catch (err: any) {
      console.error(`[CourseAlerts] Error:`, err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Usar una referencia para evitar llamadas duplicadas
    const isMounted = { current: true };
    
    if (courseId && token && isMounted.current) {
      console.log(`[CourseAlerts] useEffect ejecutado para el curso: ${courseId}`);
      checkIfCourseInstructor();
      fetchNotifications();
    }
    
    // Función de limpieza
    return () => {
      isMounted.current = false;
    };
  }, [courseId, token]);

  // Marcar notificación como leída
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al marcar como leída');
      }

      // Actualizar el estado local
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId 
          ? { ...notif, isRead: true } 
          : notif
      ));
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // Enviar nueva alerta
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          title,
          message,
          isAlert: true
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar la alerta');
      }

      // Limpiar formulario y cerrar diálogo
      setTitle('');
      setMessage('');
      setIsDialogOpen(false);
      
      // Recargar notificaciones
      fetchNotifications();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId: string) => {
    try {
      // Confirmar antes de eliminar
      if (!confirm('¿Estás seguro de que deseas eliminar esta alerta?')) {
        return;
      }

      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la alerta');
      }

      // Actualizar el estado local
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      toast.success('Éxito', {
        description: 'Alerta eliminada correctamente.'
      });
    } catch (err: any) {
      console.error(err.message);
      toast.error('Error', {
        description: 'No se pudo eliminar la alerta.'
      });
    }
  };

  // Abrir modal de edición
  const openEditDialog = (notification: NotificationProps) => {
    setEditingNotification(notification);
    setEditTitle(notification.title);
    setEditMessage(notification.message);
    setEditDialogOpen(true);
  };

  // Guardar cambios de la notificación
  const saveNotificationChanges = async () => {
    if (!editingNotification) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${editingNotification._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          message: editMessage
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la alerta');
      }

      const updatedNotification = await response.json();

      // Actualizar el estado local
      setNotifications(prev => prev.map(notif => 
        notif._id === editingNotification._id 
          ? { ...notif, title: updatedNotification.title, message: updatedNotification.message } 
          : notif
      ));
      
      setEditDialogOpen(false);
      toast.success('Éxito', {
        description: 'Alerta actualizada correctamente.'
      });
    } catch (err: any) {
      console.error(err.message);
      toast.error('Error', {
        description: 'No se pudo actualizar la alerta.'
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Cargando alertas...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Alertas del Curso</h2>
        {canCreateAlert && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Crear Nueva Alerta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Alerta</DialogTitle>
                <DialogDescription>
                  Envía una alerta a todos los estudiantes inscritos en este curso.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Título</label>
                    <Input 
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título de la alerta"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Mensaje</label>
                    <Textarea 
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escribe aquí el mensaje para los estudiantes"
                      rows={5}
                      required
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Alerta'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay alertas disponibles para este curso.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification._id} className={notification.isRead ? "bg-white" : "bg-blue-50"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{notification.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <Badge variant="default" className="ml-2">
                        Nueva
                      </Badge>
                    )}
                    {canManageNotifications && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditDialog(notification)}
                          className="p-1 h-auto"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteNotification(notification._id)}
                          className="p-1 h-auto text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <CardDescription>
                  Por: {notification.sender.name} • {new Date(notification.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{notification.message}</p>
              </CardContent>
              <CardFooter>
                {!notification.isRead && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => markAsRead(notification._id)}
                  >
                    Marcar como leída
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}

          {/* Modal de edición de alerta */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Alerta</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-title" className="text-sm font-medium">Título</label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-message" className="text-sm font-medium">Mensaje</label>
                  <Textarea
                    id="edit-message"
                    rows={5}
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={saveNotificationChanges}>Guardar cambios</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default CourseAlerts;