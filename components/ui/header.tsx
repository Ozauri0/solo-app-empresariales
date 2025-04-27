"use client"

import Link from "next/link"
import { Bell, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/ui/sidebar"

export function Header() {
  return (
    <header className="sticky top-0 z-10 h-14 w-full border-b bg-white flex items-center px-4 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="p-0">
          <Sidebar isMobile={true} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex items-center justify-between gap-4 lg:gap-6 lg:ml-6">
        <form className="hidden md:flex md:flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Buscar..." className="w-full pl-8 bg-slate-50 border-slate-200" />
          </div>
        </form>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificaciones</span>
          </Button>
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Perfil</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}