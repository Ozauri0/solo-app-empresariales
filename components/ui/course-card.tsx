import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CourseCardProps {
  course: {
    id: string
    code: string
    name: string
    instructor: string
    image: string
  }
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-32">
        <Image src={course.image || "/placeholder.svg"} alt={course.name} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{course.name}</h3>
        <p className="text-sm text-muted-foreground">{course.code}</p>
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
