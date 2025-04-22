import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

export default function AssignmentsPage() {
  const pendingAssignments = [
    {
      id: "1",
      title: "Primeros pasos con Python",
      course: "CS101 - Introducción a la Programación",
      dueDate: "30 de abril, 2024",
      status: "pendiente",
    },
    {
      id: "2",
      title: "Estructuras condicionales",
      course: "CS101 - Introducción a la Programación",
      dueDate: "7 de mayo, 2024",
      status: "pendiente",
    },
    {
      id: "3",
      title: "Ensayo sobre Literatura Moderna",
      course: "ENG201 - Literatura Inglesa",
      dueDate: "3 de mayo, 2024",
      status: "pendiente",
    },
  ]

  const completedAssignments = [
    {
      id: "4",
      title: "Introducción a la Historia Contemporánea",
      course: "HIS105 - Historia Contemporánea",
      dueDate: "15 de abril, 2024",
      submittedDate: "14 de abril, 2024",
      grade: "90/100",
      status: "completado",
    },
    {
      id: "5",
      title: "Ejercicios de Cálculo",
      course: "MAT202 - Cálculo Avanzado",
      dueDate: "10 de abril, 2024",
      submittedDate: "9 de abril, 2024",
      grade: "85/100",
      status: "completado",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mis Tareas</h1>

      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="completadas">Completadas</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="space-y-4 pt-4">
          {pendingAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{assignment.title}</h2>
                    <p className="text-muted-foreground">{assignment.course}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Fecha de entrega: {assignment.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pendiente
                    </Badge>
                    <Link href={`/assignments/${assignment.id}`}>
                      <Button>Ver tarea</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completadas" className="space-y-4 pt-4">
          {completedAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{assignment.title}</h2>
                    <p className="text-muted-foreground">{assignment.course}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Entregado: {assignment.submittedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Calificación: {assignment.grade}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Completado
                    </Badge>
                    <Link href={`/assignments/${assignment.id}`}>
                      <Button variant="outline">Ver detalles</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
