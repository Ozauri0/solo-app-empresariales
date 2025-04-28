'use client'

import ProtectedRoute from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  const receivedMessages = [
    {
      id: "1",
      sender: "Dr. Juan Pérez",
      subject: "Recordatorio: Tarea pendiente",
      preview: "Le recuerdo que la tarea de Introducción a la Programación debe ser entregada...",
      date: "22 de abril, 2024",
      course: "CS101 - Introducción a la Programación",
      read: false,
    },
    {
      id: "2",
      sender: "Dra. María González",
      subject: "Material adicional para el próximo examen",
      preview: "Adjunto encontrará material de estudio adicional para preparar el examen...",
      date: "20 de abril, 2024",
      course: "MAT202 - Cálculo Avanzado",
      read: true,
    },
    {
      id: "3",
      sender: "Administración Académica",
      subject: "Información sobre inscripción al próximo semestre",
      preview: "Le informamos que el período de inscripción para el próximo semestre comienza...",
      date: "18 de abril, 2024",
      course: "",
      read: true,
    },
  ]

  const sentMessages = [
    {
      id: "4",
      recipient: "Dr. Juan Pérez",
      subject: "Consulta sobre el proyecto final",
      preview: "Estimado profesor, me gustaría consultar algunas dudas respecto al proyecto final...",
      date: "19 de abril, 2024",
      course: "CS101 - Introducción a la Programación",
    },
    {
      id: "5",
      recipient: "Soporte Técnico",
      subject: "Problema de acceso a la plataforma",
      preview: "He tenido dificultades para acceder a la plataforma desde mi dispositivo móvil...",
      date: "15 de abril, 2024",
      course: "",
    },
  ]

  const archivedMessages = [
    {
      id: "6",
      sender: "Biblioteca Central",
      subject: "Recordatorio de devolución de libro",
      preview: "Le recordamos que el libro 'Fundamentos de Algoritmos' debe ser devuelto...",
      date: "10 de abril, 2024",
      course: "",
      read: true,
    },
    {
      id: "7",
      sender: "Prof. Carlos Rodríguez",
      subject: "Cambio de horario de clase",
      preview: "Informo que la clase de Historia Contemporánea del próximo lunes será...",
      date: "5 de abril, 2024",
      course: "HIS105 - Historia Contemporánea",
      read: true,
    },
  ]

  return (
    <ProtectedRoute>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mensajes</h1>
          <Button>Nuevo Mensaje</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Conversaciones</CardTitle>
                <CardDescription>Mensajes recientes</CardDescription>
                <div className="mt-2">
                  <Input type="text" placeholder="Buscar mensajes..." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Conversaciones aquí */}
                  <div className="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-gray-100 border-l-4 border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                      <span className="text-white font-medium">JD</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Juan Docente</p>
                      <p className="text-sm text-gray-500 truncate">Respecto a la tarea de la semana...</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-xs text-gray-500">12:30 PM</p>
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">2</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                    <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center">
                      <span className="text-slate-700 font-medium">MC</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">María Coordinadora</p>
                      <p className="text-sm text-gray-500 truncate">Información sobre el próximo examen</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-xs text-gray-500">Ayer</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                    <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center">
                      <span className="text-slate-700 font-medium">AP</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Alberto Profesor</p>
                      <p className="text-sm text-gray-500 truncate">Material complementario para el curso</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-xs text-gray-500">Lun</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0 border-b">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <span className="text-white font-medium">JD</span>
                  </div>
                  <div>
                    <CardTitle>Juan Docente</CardTitle>
                    <CardDescription>Profesor - Programación Avanzada</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto p-4">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] self-start">
                      <p className="text-sm">Hola, quería consultarte sobre la tarea que asigné la semana pasada. ¿Has tenido la oportunidad de revisarla?</p>
                      <p className="text-xs text-gray-500 mt-1">10:15 AM</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] self-start">
                      <p className="text-sm">También quería recordarte que el plazo de entrega es este viernes.</p>
                      <p className="text-xs text-gray-500 mt-1">10:16 AM</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 items-end">
                    <div className="bg-slate-800 text-white p-3 rounded-lg max-w-[80%]">
                      <p className="text-sm">Sí, profesor. Ya he comenzado a trabajar en ella.</p>
                      <p className="text-xs text-gray-300 mt-1">10:45 AM</p>
                    </div>
                    <div className="bg-slate-800 text-white p-3 rounded-lg max-w-[80%]">
                      <p className="text-sm">Tengo algunas dudas sobre el tercer ejercicio. ¿Podríamos discutirlo?</p>
                      <p className="text-xs text-gray-300 mt-1">10:46 AM</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] self-start">
                      <p className="text-sm">Claro, con gusto. ¿Qué parte del ejercicio te está causando problemas?</p>
                      <p className="text-xs text-gray-500 mt-1">12:30 PM</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] self-start">
                      <p className="text-sm">Si prefieres, podemos reunirnos en mi oficina mañana a las 3:00 PM.</p>
                      <p className="text-xs text-gray-500 mt-1">12:31 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input className="flex-grow" placeholder="Escribe un mensaje..." />
                  <Button>Enviar</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}