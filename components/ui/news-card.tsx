import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface NewsCardProps {
  news: {
    _id: string
    title: string
    content: string
    author: {
      name: string
    }
    image?: string
    createdAt: string
  }[]
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Noticias</CardTitle>
        <CardDescription>Información y novedades de la plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {news && news.length > 0 ? (
            news.map((item) => (
              <div key={item._id} className="border-b pb-4 last:border-0 last:pb-0">
                <h3 className="font-medium text-lg">{item.title}</h3>
                {item.image && (
                  <div className="my-2">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="rounded-md w-full max-h-48 object-cover"
                    />
                  </div>
                )}
                <div className="text-sm mt-2" dangerouslySetInnerHTML={{ __html: item.content }} />
                <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                  <span>{item.author?.name || 'Administrador'}</span>
                  <span>{formatDate(new Date(item.createdAt))}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No hay noticias disponibles</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}