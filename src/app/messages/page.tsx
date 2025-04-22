import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Clock, User, Star, Archive } from "lucide-react"

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mis Mensajes</h1>
        <Button>
          <Mail className="mr-2 h-4 w-4" />
          Nuevo Mensaje
        </Button>
      </div>

      <Tabs defaultValue="recibidos">
        <TabsList>
          <TabsTrigger value="recibidos">Recibidos</TabsTrigger>
          <TabsTrigger value="enviados">Enviados</TabsTrigger>
          <TabsTrigger value="archivados">Archivados</TabsTrigger>
        </TabsList>

        <TabsContent value="recibidos" className="space-y-4 pt-4">
          {receivedMessages.map((message) => (
            <Card key={message.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">{message.subject}</h2>
                      {!message.read && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          Nuevo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">De: {message.sender}</span>
                    </div>
                    {message.course && (
                      <span className="text-sm text-muted-foreground block mt-1">
                        {message.course}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{message.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {message.preview}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/messages/${message.id}`}>
                      <Button>Leer mensaje</Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="enviados" className="space-y-4 pt-4">
          {sentMessages.map((message) => (
            <Card key={message.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{message.subject}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Para: {message.recipient}</span>
                    </div>
                    {message.course && (
                      <span className="text-sm text-muted-foreground block mt-1">
                        {message.course}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{message.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {message.preview}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/messages/${message.id}`}>
                      <Button variant="outline">Ver mensaje</Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="archivados" className="space-y-4 pt-4">
          {archivedMessages.map((message) => (
            <Card key={message.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{message.subject}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">De: {message.sender}</span>
                    </div>
                    {message.course && (
                      <span className="text-sm text-muted-foreground block mt-1">
                        {message.course}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{message.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {message.preview}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/messages/${message.id}`}>
                      <Button variant="outline">Ver mensaje</Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
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