import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

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

  // Verificar si el usuario es administrador o instructor
  const canCreateAlert = user?.role === 'admin' || user?.role === 'instructor';

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
                  {!notification.isRead && (
                    <Badge variant="default" className="ml-2">
                      Nueva
                    </Badge>
                  )}
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
        </div>
      )}
    </div>
  );
};

export default CourseAlerts;