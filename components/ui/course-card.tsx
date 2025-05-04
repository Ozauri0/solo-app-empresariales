import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface CourseCardProps {
  course: {
    id: string
    code: string
    name: string
    instructor: string
    image?: string
  }
}

// Función para construir la URL correcta para las imágenes de cursos
const getCourseImageUrl = (imagePath?: string): string => {
  // Si no hay imagen, usar un placeholder
  if (!imagePath) {
    return '/placeholder.svg?height=200&width=400';
  }
  
  // Si la imagen ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Si es una ruta que comienza con / y tenemos API_BASE_URL definido, añadir el prefijo
  if (imagePath.startsWith('/') && API_BASE_URL) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // En producción (API_BASE_URL vacío) o para rutas relativas
  return imagePath;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/9] w-full">
        <Image 
          src={getCourseImageUrl(course.image)} 
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
