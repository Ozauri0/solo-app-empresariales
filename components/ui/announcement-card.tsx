import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AnnouncementCardProps {
  announcements: {
    id: string
    title: string
    content: string
    date: string
  }[]
}

export function AnnouncementCard({ announcements }: AnnouncementCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anuncios</CardTitle>
        <CardDescription>Anuncios importantes del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="border-b pb-4 last:border-0 last:pb-0">
              <h3 className="font-medium">{announcement.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
              <p className="text-xs text-muted-foreground mt-2">{announcement.date}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
