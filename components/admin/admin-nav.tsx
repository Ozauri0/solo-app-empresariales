'use client'

import { usePathname, useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserIcon, BookIcon } from "lucide-react"

export default function AdminNav() {
  const router = useRouter()
  const pathname = usePathname()

  // Determinar la pestaña activa basada en la ruta actual
  const getActiveTab = () => {
    if (pathname.includes('/admin/users')) return 'users'
    if (pathname.includes('/admin/courses')) return 'courses'
    if (pathname.includes('/admin/news')) return 'news'
    return 'users' // Por defecto, mostrar usuarios
  }

  // Funciones para navegar a las diferentes páginas de administración
  const navigateToUsers = () => {
    router.push('/admin/users')
  }

  const navigateToCourses = () => {
    router.push('/admin/courses')
  }

  const navigateToNews = () => {
    router.push('/admin/news')
  }
  
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
      <Tabs value={getActiveTab()} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" onClick={navigateToUsers}>
            <UserIcon className="mr-2 h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="courses" onClick={navigateToCourses}>
            <BookIcon className="mr-2 h-4 w-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="news" onClick={navigateToNews}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2 h-4 w-4"
            >
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
              <path d="M18 14h-8"></path>
              <path d="M15 18h-5"></path>
              <path d="M10 6h8v4h-8V6Z"></path>
            </svg>
            Noticias
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}