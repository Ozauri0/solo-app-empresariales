'use client'

import ProtectedRoute from "@/components/protected-route";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AssignmentsPage() {
  const upcomingAssignments = [
    {
      id: "1",
      title: "Primeros pasos con Python",
      course: "CS101 - Introducción a la Programación",
      dueDate: "30 de abril, 2024",
      daysLeft: 5,
      description: "Introducción a los conceptos básicos de Python.",
    },
    {
      id: "2",
      title: "Estructuras condicionales",
      course: "CS101 - Introducción a la Programación",
      dueDate: "7 de mayo, 2024",
      daysLeft: 12,
      description: "Uso de if, else y switch en JavaScript.",
    },
    {
      id: "3",
      title: "Ensayo sobre Literatura Moderna",
      course: "ENG201 - Literatura Inglesa",
      dueDate: "3 de mayo, 2024",
      daysLeft: 10,
      description: "Análisis de las características de la literatura moderna.",
    },
  ]

  const completedAssignments = [
    {
      id: "4",
      title: "Introducción a la Historia Contemporánea",
      course: "HIS105 - Historia Contemporánea",
      dueDate: "15 de abril, 2024",
      submittedDate: "14 de abril, 2024",
      grade: 90,
      feedback: "Buen trabajo, pero revisa la conclusión.",
    },
    {
      id: "5",
      title: "Ejercicios de Cálculo",
      course: "MAT202 - Cálculo Avanzado",
      dueDate: "10 de abril, 2024",
      submittedDate: "9 de abril, 2024",
      grade: 85,
      feedback: "Bien, aunque hay algunos errores en los ejercicios 3 y 5.",
    },
  ]

  const upcomingDates = [
    { month: "Abril", day: 30, title: "Entrega Proyecto 1", course: "CS101" },
    { month: "Mayo", day: 7, title: "Examen Parcial", course: "CS101" },
    { month: "Mayo", day: 10, title: "Entrega Ensayo", course: "ENG201" },
  ]

  return (
    <ProtectedRoute>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tareas y Actividades</h1>
          <Button>Nueva Tarea</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Próximas Entregas</h2>
              <div className="divide-y">
                {upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        <p className="text-sm text-gray-500">{assignment.course}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assignment.daysLeft < 2 
                          ? 'bg-red-100 text-red-800' 
                          : assignment.daysLeft < 5 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {assignment.daysLeft === 0 
                          ? 'Hoy' 
                          : assignment.daysLeft === 1
                            ? 'Mañana'
                            : `${assignment.daysLeft} días`}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{assignment.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Fecha límite: {assignment.dueDate}
                      </div>
                      <Button variant="outline" size="sm">Ver Detalles</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Tareas Completadas</h2>
              <div className="divide-y">
                {completedAssignments.map((assignment) => (
                  <div key={assignment.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        <p className="text-sm text-gray-500">{assignment.course}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assignment.grade >= 90 
                          ? 'bg-green-100 text-green-800' 
                          : assignment.grade >= 70 
                            ? 'bg-blue-100 text-blue-800' 
                            : assignment.grade >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {assignment.grade}/100
                      </span>
                    </div>
                    <p className="text-sm mb-3">{assignment.feedback}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Entregado: {assignment.submittedDate}
                      </div>
                      <Button variant="outline" size="sm">Ver Detalles</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Resumen</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Tareas Pendientes</span>
                  <span className="font-semibold">{upcomingAssignments.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Tareas Completadas</span>
                  <span className="font-semibold">{completedAssignments.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Calificación Promedio</span>
                  <span className="font-semibold">
                    {completedAssignments.length > 0
                      ? Math.round(completedAssignments.reduce((sum, assignment) => sum + assignment.grade, 0) / completedAssignments.length)
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Calendario</h2>
              <div className="space-y-3">
                {upcomingDates.map((date, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-3 rounded-lg border"
                  >
                    <div className="w-12 h-12 bg-slate-800 text-white rounded-lg flex flex-col items-center justify-center mr-3">
                      <span className="text-xs">{date.month}</span>
                      <span className="text-lg font-bold">{date.day}</span>
                    </div>
                    <div>
                      <p className="font-medium">{date.title}</p>
                      <p className="text-sm text-gray-500">{date.course}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
