"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
  LogOut,
  Shield,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext" // Importamos el contexto de autenticación

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

export function Sidebar({ isMobile }: { isMobile?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth() // Usamos el contexto de autenticación
  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    // Usamos la función de logout del contexto
    logout()
    // Redirigir a la página de inicio de sesión
    router.push('/')
  }

  return (
    <div className={cn(
      "flex flex-col border-r bg-slate-50 overflow-hidden",
      isMobile 
        ? "w-full h-full" 
        : "hidden lg:flex fixed top-0 left-0 h-screen w-64"
    )}>
      <div className="h-14 border-b flex items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-800">
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">LP</span>
          </div>
          <span>Campus Virtual</span>
        </Link>
      </div>
      <div className="flex-1 py-4 px-2 overflow-y-auto">
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
          
          {/* Enlaces de administración solo visibles para administradores */}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                pathname === "/admin" || pathname.startsWith("/admin/")
                  ? "bg-slate-200 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Shield className="h-5 w-5" />
              Administración
            </Link>
          )}
        </nav>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
            <User className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="font-medium text-sm">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-muted-foreground">{user?.email || 'email@ejemplo.com'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
