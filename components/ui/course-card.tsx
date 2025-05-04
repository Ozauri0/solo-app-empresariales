import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFileUrl } from "@/lib/utils"

interface CourseCardProps {
  course: {
    id: string
    code: string
    name: string
    instructor: string
    image?: string
  }
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/9] w-full">
        <Image 
          src={getFileUrl(course.image, 'course-image')} 
          alt={course.name} 
          width={400}
          height={225}
          className="object-cover w-full h-full"
          style={{
            objectPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-3 w-full">
            <Badge variant="outline" className="bg-white/20 text-white border-white/40 mb-1">{course.code}</Badge>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{course.name}</h3>
        <p className="text-sm text-muted-foreground">{course.instructor}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Ver curso
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
