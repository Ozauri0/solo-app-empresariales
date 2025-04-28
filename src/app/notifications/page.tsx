"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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
                  {unreadNotifications.map((notification) => (
                    <Card key={notification._id} className="bg-blue-50">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="flex items-center gap-2">
                            {notification.title}
                            <Badge variant="default" className="ml-2">
                              Nueva
                            </Badge>
                          </CardTitle>
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
                      <CardFooter className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => markAsRead(notification._id)}
                        >
                          Marcar como leída
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de notificaciones leídas */}
            {readNotifications.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Leídas</h2>
                <div className="space-y-3">
                  {readNotifications.map((notification) => (
                    <Card key={notification._id} className="bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="flex items-center gap-2">
                            {notification.title}
                          </CardTitle>
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
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}