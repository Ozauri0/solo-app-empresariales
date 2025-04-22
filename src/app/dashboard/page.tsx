import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "@/components/ui/course-card"
import { AnnouncementCard } from "@/components/ui/announcement-card"
import { CalendarCard } from "@/components/ui/calendar-card"

export default function DashboardPage() {
  const courses = [
    {
      id: "1",
      code: "CS101",
      name: "Introducción a la Programación",
      instructor: "Dr. Juan Pérez",
      image: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "2",
      code: "MAT202",
      name: "Cálculo Avanzado",
      instructor: "Dra. María González",
      image: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "3",
      code: "HIS105",
      name: "Historia Contemporánea",
      instructor: "Prof. Carlos Rodríguez",
      image: "/placeholder.svg?height=100&width=200",
    },
  ]

  const announcements = [
    {
      id: "1",
      title: "Mantenimiento programado",
      content: "El sistema estará en mantenimiento el próximo sábado de 2:00 AM a 5:00 AM.",
      date: "2024-04-18",
    },
    {
      id: "2",
      title: "Nuevos cursos disponibles",
      content: "Se han añadido nuevos cursos para el próximo semestre. Revisa el catálogo.",
      date: "2024-04-15",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bienvenido, Estudiante</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle>Mis Cursos</CardTitle>
            <CardDescription>Cursos en los que estás inscrito actualmente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <AnnouncementCard announcements={announcements} />
          <CalendarCard />
        </div>
      </div>
    </div>
  )
}
