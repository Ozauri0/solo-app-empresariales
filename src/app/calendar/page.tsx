'use client'

import ProtectedRoute from "@/components/protected-route";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Definición de tipos
interface CalendarEvent {
  id: number;
  title: string;
  course: string;
  date: string;
  time: string;
  type: string;
  description: string;
}

export default function CalendarPage() {
  // Datos de ejemplo para eventos del calendario
  const events: CalendarEvent[] = [
    {
      id: 1,
      title: "Entrega de Proyecto Final",
      course: "Programación Web Avanzada",
      date: "2025-04-25",
      time: "23:59",
      type: "deadline",
      description: "Entrega final del proyecto del semestre",
    },
    {
      id: 2,
      title: "Examen Parcial",
      course: "Bases de Datos",
      date: "2025-04-28",
      time: "14:00 - 16:00",
      type: "exam",
      description: "Examen sobre normalización y SQL avanzado",
    },
    {
      id: 3,
      title: "Laboratorio Práctico",
      course: "Inteligencia Artificial",
      date: "2025-05-02",
      time: "10:00 - 12:00",
      type: "lab",
      description: "Práctica sobre redes neuronales",
    },
    {
      id: 4,
      title: "Taller Colaborativo",
      course: "Arquitectura de Software",
      date: "2025-05-05",
      time: "15:00 - 17:00",
      type: "workshop",
      description: "Sesión de trabajo en equipo para diseño de arquitectura",
    },
    {
      id: 5,
      title: "Conferencia de Seguridad",
      course: "Seguridad Informática",
      date: "2025-05-10",
      time: "18:00 - 20:00",
      type: "conference",
      description: "Conferencia sobre ciberseguridad actual",
    },
  ];

  // Estados para el calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState(0);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [daysInMonth, setDaysInMonth] = useState(0);
  const [firstDayOfMonth, setFirstDayOfMonth] = useState(0);
  const [currentDay, setCurrentDay] = useState(0);

  // Inicializar el calendario al cargar
  useEffect(() => {
    updateCalendarData(currentDate);
  }, [currentDate]);

  // Actualizar todos los datos del calendario
  const updateCalendarData = (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    setCurrentMonth(date.toLocaleString('es-ES', { month: 'long' }));
    setCurrentYear(year);
    setCurrentMonthIndex(month);
    setCurrentDay(new Date().getDate());
    
    // Calcular los días en el mes actual
    setDaysInMonth(new Date(year, month + 1, 0).getDate());
    
    // Calcular el primer día de la semana del mes (0 = Domingo, 1 = Lunes, etc.)
    setFirstDayOfMonth(new Date(year, month, 1).getDay());
  };

  // Navegación del calendario
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentYear, currentMonthIndex - 1, 1);
    setCurrentDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentYear, currentMonthIndex + 1, 1);
    setCurrentDate(nextMonth);
  };

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
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach(event => {
    if (!eventsByDate[event.date]) {
      eventsByDate[event.date] = [];
    }
    eventsByDate[event.date].push(event);
  });

  // Ordenar fechas
  const sortedDates = Object.keys(eventsByDate).sort();

  // Filtrar próximos eventos (solo los 3 más cercanos)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <ProtectedRoute>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Calendario Académico</h1>
          <Button>Nuevo Evento</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">{currentMonth} {currentYear}</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handlePrevMonth}>Anterior</Button>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>Siguiente</Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, i) => (
                  <div key={i} className="text-center py-2 font-medium text-sm">
                    {day}
                  </div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2 text-center"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const currentMonthStr = (currentMonthIndex + 1).toString().padStart(2, '0');
                  const dayStr = day.toString().padStart(2, '0');
                  const dateStr = `${currentYear}-${currentMonthStr}-${dayStr}`;
                  
                  const hasEvents = events.some(event => event.date === dateStr);
                  
                  const isToday = day === currentDay && 
                                 currentMonthIndex === new Date().getMonth() &&
                                 currentYear === new Date().getFullYear();
                  
                  return (
                    <div 
                      key={`day-${day}`}
                      className={`p-2 min-h-[80px] border rounded-md ${
                        isToday ? 'bg-slate-100 border-slate-800' : ''
                      }`}
                    >
                      <div className="text-right mb-1">
                        <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>{day}</span>
                      </div>
                      {hasEvents && (
                        <div className="mt-1">
                          {events
                            .filter(event => event.date === dateStr)
                            .map((event, index) => (
                              <div 
                                key={index}
                                className={`text-xs p-1 mb-1 rounded truncate ${getEventTypeColor(event.type)}`}
                              >
                                {event.title}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Próximos Eventos</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border-l-4 border-slate-800 pl-4 py-2">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-gray-500">{formatDate(event.date)} - {event.time}</p>
                    <p className="text-sm mt-1">{event.description}</p>
                    <p className="text-xs mt-2 text-gray-500">{event.course}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Crear Evento</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Nombre del evento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="clase">Clase</option>
                    <option value="tarea">Tarea</option>
                    <option value="examen">Examen</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Detalles del evento"
                  />
                </div>
                <Button className="w-full">Guardar Evento</Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}