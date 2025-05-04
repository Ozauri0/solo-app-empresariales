import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import { X, Check } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  date: string
  isRead?: boolean
}

interface AnnouncementCardProps {
  announcements: Announcement[]
}

export function AnnouncementCard({ announcements: initialAnnouncements }: AnnouncementCardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  const markAsRead = async (id: string) => {
    try {
      // Llamada a la API para marcar la notificación como leída
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al marcar como leída');
      }

      // Actualizar el estado localmente
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === id 
            ? { ...announcement, isRead: true } 
            : announcement
        )
      );

      toast.success('Anuncio marcado como leído');
    } catch (error) {
      console.error('Error:', error);
      toast.error('No se pudo marcar el anuncio como leído');
    }
  };

  // Filtrar para mostrar solo anuncios no leídos
  const unreadAnnouncements = announcements.filter(announcement => !announcement.isRead);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Anuncios</CardTitle>
          <CardDescription>Anuncios importantes del sistema</CardDescription>
        </div>
        {unreadAnnouncements.length > 0 && (
          <div className="bg-primary text-primary-foreground text-xs font-medium rounded-full px-2 py-1">
            {unreadAnnouncements.length}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {unreadAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {unreadAnnouncements.map((announcement) => (
              <div key={announcement.id} className="border rounded-md p-3 relative">
                <h3 className="font-medium pr-8">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    {typeof announcement.date === 'string' 
                      ? announcement.date 
                      : formatDate(new Date(announcement.date))}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => markAsRead(announcement.id)}
                    className="h-8 px-2"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    <span className="text-xs">Marcar como leído</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No hay anuncios pendientes</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
