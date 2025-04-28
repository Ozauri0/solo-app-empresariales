"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2 } from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  sender: {
    _id: string;
    name: string;
  };
  courseId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el modal de edición
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');

  // Verificar si el usuario es admin o instructor
  const canManageNotifications = user && (user.role === 'admin' || user.role === 'instructor');

  // Cargar todas las notificaciones del usuario
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las notificaciones');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error', {
        description: 'No se pudieron cargar las notificaciones.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

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
      toast.error('Error', {
        description: 'No se pudo marcar la notificación como leída.'
      });
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId: string) => {
    try {
      // Confirmar antes de eliminar
      if (!confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
        return;
      }

      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la notificación');
      }

      // Actualizar el estado local
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      toast.success('Éxito', {
        description: 'Notificación eliminada correctamente.'
      });
    } catch (err: any) {
      console.error(err.message);
      toast.error('Error', {
        description: 'No se pudo eliminar la notificación.'
      });
    }
  };

  // Abrir modal de edición
  const openEditDialog = (notification: Notification) => {
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
        throw new Error('Error al actualizar la notificación');
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
        description: 'Notificación actualizada correctamente.'
      });
    } catch (err: any) {
      console.error(err.message);
      toast.error('Error', {
        description: 'No se pudo actualizar la notificación.'
      });
    }
  };

  // Ir al curso desde la notificación
  const goToCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  // Filtrar notificaciones no leídas
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Cargando notificaciones...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Renderizar la tarjeta de notificación con opciones de edición y eliminación para admin/instructor
  const renderNotificationCard = (notification: Notification, isUnread: boolean) => (
    <Card key={notification._id} className={isUnread ? "bg-blue-50" : "bg-white"}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            {notification.title}
            {isUnread && (
              <Badge variant="default" className="ml-2">
                Nueva
              </Badge>
            )}
          </CardTitle>
          
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
        <CardDescription className="text-sm">
          {notification.courseId?.name && (
            <span 
              className="font-semibold cursor-pointer hover:underline" 
              onClick={() => goToCourse(notification.courseId._id)}
            >
              {notification.courseId.name}
            </span>
          )}
          {" • "}
          Por: {notification.sender.name} • {new Date(notification.createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{notification.message}</p>
      </CardContent>
      {isUnread && (
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => markAsRead(notification._id)}
          >
            Marcar como leída
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mis Notificaciones</h1>
          <p className="text-sm">{unreadNotifications.length} notificaciones sin leer</p>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-500">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sección de notificaciones no leídas */}
            {unreadNotifications.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">No leídas</h2>
                <div className="space-y-3">
                  {unreadNotifications.map((notification) => renderNotificationCard(notification, true))}
                </div>
              </div>
            )}

            {/* Sección de notificaciones leídas */}
            {readNotifications.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Leídas</h2>
                <div className="space-y-3">
                  {readNotifications.map((notification) => renderNotificationCard(notification, false))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de edición de notificación */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Notificación</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
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
    </ProtectedRoute>
  );
}