"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Book, Calendar, MapPin, Phone, Lock, Key, AlertCircle } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <Button variant="outline">Guardar Cambios</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Gestiona tu perfil y preferencias</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                <User className="h-16 w-16 text-slate-500" />
              </div>
              <Button size="sm" variant="secondary" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0">
                <span className="sr-only">Cambiar avatar</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </Button>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium">Christian Ferrer</h3>
              <p className="text-sm text-muted-foreground">Estudiante</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge>RUT: 20.706.XXX-X</Badge>
              </div>
            </div>
            <div className="w-full space-y-2 border-t pt-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">christianferrer.dev@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Ingeniería Civil Informatica</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Semestre 8</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Temuco</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="personal">Datos Personales</TabsTrigger>
              <TabsTrigger value="academic">Información Académica</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Datos Personales</CardTitle>
                  <CardDescription>Actualiza tu información de contacto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Nombre(s)</Label>
                      <Input id="first-name" placeholder="Nombre" defaultValue="Christian" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Apellidos</Label>
                      <Input id="last-name" placeholder="Apellidos" defaultValue="Ferrer Retamal" disabled />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input id="email" type="email" defaultValue="christianferrer.dev@gmail.com" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" type="tel" placeholder="+56912345678" defaultValue="+56912345678" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input id="address" placeholder="Calle, Número" defaultValue="Av. siempre viva" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input id="city" defaultValue="Temuco" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Region</Label>
                      <Input id="state" defaultValue="Araucanía" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">Código Postal</Label>
                      <Input id="zip" defaultValue="4870000" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="academic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Académica</CardTitle>
                  <CardDescription>Tu información académica actual</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="student-id">Matrícula</Label>
                      <Input id="student-id" defaultValue="20706XXXX" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="program">Programa</Label>
                      <Input id="program" defaultValue="Ingeniería Civil Informatica" disabled />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semestre Actual</Label>
                      <Input id="semester" defaultValue="8" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Estado</Label>
                      <Input id="status" defaultValue="Activo" disabled />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="gpa">Promedio General</Label>
                      <Input id="gpa" defaultValue="5,6" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="advisor">Tutor Académico</Label>
                      <Input id="advisor" defaultValue="N/A" disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Contraseña</CardTitle>
                  <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña Actual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  
                  <div className="flex items-center p-3 bg-yellow-50 text-yellow-900 rounded-md text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <p>Tu contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, un número y un carácter especial.</p>
                  </div>
                  
                  <Button className="w-full sm:w-auto">Actualizar Contraseña</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sesiones Activas</CardTitle>
                  <CardDescription>Gestiona tus dispositivos y sesiones activas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-slate-100 rounded-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-slate-600"
                          >
                            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                            <path d="M12 18h.01" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Motorola edge neo 40 (Android 14)</p>
                          <p className="text-sm text-muted-foreground">Temuco · Activo ahora</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Lock className="h-4 w-4 mr-2" />
                        Cerrar
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-slate-100 rounded-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-slate-600"
                          >
                            <rect width="20" height="14" x="2" y="3" rx="2" />
                            <line x1="8" x2="16" y1="21" y2="21" />
                            <line x1="12" x2="12" y1="17" y2="21" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Linux (Ubuntu 24.04)</p>
                          <p className="text-sm text-muted-foreground">Temuco · Hace 2 días</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Lock className="h-4 w-4 mr-2" />
                        Cerrar
                      </Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Cerrar Todas las Sesiones
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}