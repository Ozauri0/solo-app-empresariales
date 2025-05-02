import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface NewsItem {
  _id: string
  title: string
  content: string
  author: {
    name: string
  }
  image?: string
  createdAt: string
  isVisible?: boolean
}

interface NewsCardProps {
  news: NewsItem | null
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
          {news ? (
            <div className="pb-4">
              <h3 className="font-medium text-lg">{news.title}</h3>
              {news.image && (
                <div className="my-2">
                  <img 
                    src={news.image} 
                    alt={news.title} 
                    className="rounded-md w-full max-h-48 object-cover"
                  />
                </div>
              )}
              {news.content && (
                <div 
                  className="text-sm mt-2 prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: news.content }} 
                />
              )}
              <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                <span>{news.author?.name || 'Administrador'}</span>
                <span>{new Date(news.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
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