import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Bell } from "lucide-react"

interface CourseNotification {
  _id: string
  title: string
  message: string
  sender: {
    _id: string
    name: string
  }
  courseId: {
    _id: string
    name: string
  }
  createdAt: string
  isRead: boolean
}

interface CourseNotificationsCardProps {
  notifications: CourseNotification[]
  token: string
  onNotificationUpdate?: () => void
}

export function CourseNotificationsCard({ notifications, token, onNotificationUpdate }: CourseNotificationsCardProps) {
  const router = useRouter()
  const [courseNotifications, setCourseNotifications] = useState<CourseNotification[]>(notifications)

  useEffect(() => {
    setCourseNotifications(notifications)
  }, [notifications])

  // Filtrar notificaciones no leídas
  const unreadNotifications = courseNotifications.filter(n => !n.isRead)
  
  // Limitar a mostrar solo las últimas 3 notificaciones
  const notificationsToShow = unreadNotifications.slice(0, 3)
  
  // Contar cuántas notificaciones adicionales hay
  const remainingCount = unreadNotifications.length - notificationsToShow.length

  // Marcar notificación como leída
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al marcar como leída')
      }

      // Actualizar el estado local
      setCourseNotifications(prev => prev.map(notif => 
        notif._id === notificationId 
          ? { ...notif, isRead: true } 
          : notif
      ))

      // Notificar al componente padre para actualizar datos si es necesario
      if (onNotificationUpdate) {
        onNotificationUpdate()
      }

      toast.success('Notificación marcada como leída')
    } catch (err: any) {
      console.error(err.message)
      toast.error('No se pudo marcar la notificación como leída')
    }
  }

  // Ir al curso desde la notificación
  const goToCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }
  
  // Ir a la página de notificaciones
  const goToNotificationsPage = () => {
    router.push('/notifications')
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>Notificaciones de tus cursos</CardDescription>
        </div>
        {unreadNotifications.length > 0 && (
          <div className="bg-primary text-primary-foreground text-xs font-medium rounded-full px-2 py-1">
            {unreadNotifications.length}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {notificationsToShow.length > 0 ? (
          <div className="space-y-4">
            {notificationsToShow.map((notification) => (
              <div key={notification._id} className="border rounded-md p-3 bg-blue-50">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{notification.title}
                    <Badge variant="default" className="ml-2 text-xs">Nueva</Badge>
                  </h3>
                </div>
                <p 
                  className="text-sm font-semibold mt-1 cursor-pointer hover:underline"
                  onClick={() => goToCourse(notification.courseId._id)}
                >
                  {notification.courseId.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    Por: {notification.sender?.name} • {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => markAsRead(notification._id)}
                    className="h-7 px-2 text-xs"
                  >
                    Marcar como leída
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Botón para ver todas las notificaciones si hay más de 3 */}
            {remainingCount > 0 && (
              <div className="mt-4">
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  onClick={goToNotificationsPage}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Ver todas las notificaciones ({remainingCount} más)
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No hay notificaciones pendientes</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}