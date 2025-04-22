import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function CalendarCard() {
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString("es", { month: "long" })
  const currentYear = currentDate.getFullYear()

  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay()

  // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const calendarDays = Array(adjustedFirstDay).fill(null).concat(days)

  // Eventos de ejemplo
  const events = [
    { day: 15, title: "Entrega de Tarea", type: "assignment" },
    { day: 20, title: "Examen Parcial", type: "exam" },
    { day: 25, title: "Reunión de Grupo", type: "meeting" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario</CardTitle>
        <CardDescription>{`${currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} ${currentYear}`}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["L", "M", "X", "J", "V", "S", "D"].map((day, index) => (
            <div key={index} className="text-xs font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            const event = events.find((e) => e.day === day)
            const isToday = day === currentDate.getDate()

            return (
              <div
                key={index}
                className={`aspect-square flex flex-col items-center justify-center text-xs rounded-md ${
                  !day ? "invisible" : isToday ? "bg-slate-200 font-bold" : "hover:bg-slate-100"
                }`}
              >
                {day}
                {event && <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-800" title={event.title}></div>}
              </div>
            )
          })}
        </div>

        <div className="mt-4 space-y-2">
          {events.map((event, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="text-xs py-0 px-1">
                {event.day}
              </Badge>
              <span>{event.title}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
