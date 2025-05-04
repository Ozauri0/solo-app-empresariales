'use client'

import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GradesPage() {
  // Datos de ejemplo para las calificaciones
  const courses = [
    {
      id: 1,
      name: "Programación Web Avanzada",
      code: "PWA101",
      grade: 70,
      status: "Aprobado",
    },
    {
      id: 2,
      name: "Bases de Datos",
      code: "BDD202",
      grade: 53,
      status: "Aprobado",
    },
    {
      id: 3,
      name: "Inteligencia Artificial",
      code: "IA303",
      grade: 70,
      status: "Aprobado",
    },
    {
      id: 4,
      name: "Arquitectura de Software",
      code: "AS404",
      grade: 57,
      status: "Aprobado",
    },
    {
      id: 5,
      name: "Seguridad Informática",
      code: "SI505",
      grade: 40,
      status: "Aprobado",
    },
    {
      id: 6,
      name: "Arquitectua de Hardware",
      code: "SI505",
      grade: 37,
      status: "Reprobado",
    },
  ];

  // Función para determinar el color de fondo según la calificación
  const getGradeColor = (grade: number) => {
    if (grade >= 60) return "bg-green-100 text-green-800";
    if (grade >= 55) return "bg-blue-100 text-blue-800";
    if (grade >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Función para determinar el color según el estado
  const getStatusColor = (status: string) => {
    return status === "Reprobado" 
      ? "bg-red-100 text-red-800" 
      : "bg-green-100 text-green-800";
  };

  return (
    <ProtectedRoute>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mis Calificaciones</h1>
          <Button variant="outline">Descargar Reporte</Button>
        </div>

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Semestre Actual</h2>
            <p className="text-gray-500">Período: Enero - Abril 2025</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-3 px-4 text-left">Código</th>
                  <th className="py-3 px-4 text-left">Asignatura</th>
                  <th className="py-3 px-4 text-center">Calificación</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{course.code}</td>
                    <td className="py-3 px-4">{course.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getGradeColor(course.grade)}`}>
                        {course.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(course.status)}`}>
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between">
            <div>
              <p className="font-medium">Promedio General: <span className="font-bold">52,32</span></p>
            </div>
            <div>
              <p className="font-medium">Créditos Completados: <span className="font-bold">13/15</span></p>
            </div>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}