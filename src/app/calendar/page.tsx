import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CalendarPage() {
  // Datos de ejemplo para eventos del calendario
  const events = [
    {
      id: 1,
      title: "Entrega de Proyecto Final",
      course: "Programación Web Avanzada",
      date: "2025-04-25",
      time: "23:59",
      type: "deadline",
    },
    {
      id: 2,
      title: "Examen Parcial",
      course: "Bases de Datos",
      date: "2025-04-28",
      time: "14:00 - 16:00",
      type: "exam",
    },
    {
      id: 3,
      title: "Laboratorio Práctico",
      course: "Inteligencia Artificial",
      date: "2025-05-02",
      time: "10:00 - 12:00",
      type: "lab",
    },
    {
      id: 4,
      title: "Taller Colaborativo",
      course: "Arquitectura de Software",
      date: "2025-05-05",
      time: "15:00 - 17:00",
      type: "workshop",
    },
    {
      id: 5,
      title: "Conferencia de Seguridad",
      course: "Seguridad Informática",
      date: "2025-05-10",
      time: "18:00 - 20:00",
      type: "conference",
    },
  ];

  // Obtener el día actual
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  // Función para formatear la fecha en formato legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Función para determinar el color según el tipo de evento
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-red-100 text-red-800 border-red-200";
      case "deadline":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "lab":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "workshop":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "conference":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Agrupar eventos por fecha
  const eventsByDate: Record<string, typeof events> = {};
  events.forEach(event => {
    if (!eventsByDate[event.date]) {
      eventsByDate[event.date] = [];
    }
    eventsByDate[event.date].push(event);
  });

  // Ordenar fechas
  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendario Académico</h1>
        <div className="flex gap-2">
          <Button variant="outline">Hoy</Button>
          <Button variant="outline">Añadir Evento</Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <Button variant="ghost" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="flex gap-3 mb-4">
            <span className="inline-flex items-center rounded-full bg-red-100 text-red-800 px-2.5 py-0.5 text-xs font-medium">
              Examen
            </span>
            <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-800 px-2.5 py-0.5 text-xs font-medium">
              Entrega
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-medium">
              Laboratorio
            </span>
            <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-medium">
              Taller
            </span>
            <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-medium">
              Conferencia
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="border-b pb-4 last:border-0">
              <h3 className="text-lg font-semibold mb-2">{formatDate(date)}</h3>
              <div className="space-y-3">
                {eventsByDate[date].map(event => (
                  <div 
                    key={event.id} 
                    className={`p-3 rounded-lg border ${getEventTypeColor(event.type)} flex justify-between items-start`}
                  >
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm">{event.course}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Próximos eventos importantes</h3>
          <div className="space-y-3">
            {events.slice(0, 3).map(event => (
              <div key={event.id} className="flex justify-between items-center p-3 rounded-lg border hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${event.type === 'exam' ? 'bg-red-500' : event.type === 'deadline' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                  <span>{event.title}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(event.date)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}