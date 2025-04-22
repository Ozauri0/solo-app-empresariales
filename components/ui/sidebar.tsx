"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Calendar,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  User,
  GraduationCap,
} from "lucide-react"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Cursos",
    href: "/courses",
    icon: BookOpen,
  },
  {
    title: "Tareas",
    href: "/assignments",
    icon: FileText,
  },
  {
    title: "Calificaciones",
    href: "/grades",
    icon: GraduationCap,
  },
  {
    title: "Calendario",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Mensajes",
    href: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Perfil",
    href: "/profile",
    icon: User,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex flex-col w-64 border-r bg-slate-50">
      <div className="h-14 border-b flex items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-800">
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">LP</span>
          </div>
          <span>Campus Virtual</span>
        </Link>
      </div>
      <div className="flex-1 py-4 px-2">
        <nav className="space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "bg-slate-200 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
            <User className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="font-medium text-sm">Estudiante Demo</p>
            <p className="text-xs text-muted-foreground">demo@alu.lp.cl</p>
          </div>
        </div>
      </div>
    </div>
  )
}
