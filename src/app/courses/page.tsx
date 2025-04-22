"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "@/components/ui/course-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function CoursesPage() {
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
    {
      id: "4",
      code: "ENG201",
      name: "Literatura Inglesa",
      instructor: "Prof. Ana Martínez",
      image: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "5",
      code: "PHY301",
      name: "Física Cuántica",
      instructor: "Dr. Roberto Sánchez",
      image: "/placeholder.svg?height=100&width=200",
    },
    {
      id: "6",
      code: "BIO202",
      name: "Biología Celular",
      instructor: "Dra. Laura Torres",
      image: "/placeholder.svg?height=100&width=200",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mis Cursos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar Cursos</CardTitle>
          <CardDescription>Busca y filtra tus cursos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input id="search" placeholder="Nombre del curso o código" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semestre</Label>
              <Select defaultValue="current">
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Seleccionar semestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Semestre Actual</SelectItem>
                  <SelectItem value="previous">Semestre Anterior</SelectItem>
                  <SelectItem value="all">Todos los Semestres</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select defaultValue="active">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
