'use client'

import React, { useState, useEffect } from "react"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Book, Calendar, MapPin, Phone, Lock, Key, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/utils"

export default function ProfilePage() {
  // Definiendo interfaces para el tipo de sesión activa
  interface ActiveSession {
    _id: string;
    deviceType: string;
    deviceName: string;
    location: string;
    lastActive: Date | string;
  }

  // Interfaz para el estado del usuario
  interface UserState {
    name: string;
    username: string;
    email: string;
    role: string;
    rut: string;
    program: string;
    yearOfAdmission: number;
    status: string;
    phone: string;
    address: string;
    studentId: string;
    gpa: string;
    advisor: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    activeSessions: ActiveSession[];
  }

  const [user, setUser] = useState<UserState>({
    name: "",
    username: "",
    email: "",
    role: "student",
    rut: "",
    program: "",
    yearOfAdmission: new Date().getFullYear(),
    status: "Activo",
    phone: "",
    address: "",
    studentId: "",
    gpa: "0.0",
    advisor: "N/A",
    // Contraseñas
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    // Sesiones activas
    activeSessions: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Obtener datos del usuario al cargar la página
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          setUser(prev => ({
            ...prev,
            ...data.user,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }));
        } else {
          toast.error("Error al cargar el perfil", {
            description: data.message
          });
        }
      } catch (error) {
        toast.error("Error de conexión", {
          description: "No se pudo conectar con el servidor"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Función para manejar cambios en los campos de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  // Función para guardar cambios en el perfil
  const handleSaveProfile = async () => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("No autorizado", {
          description: "Debes iniciar sesión primero"
        });
        return;
      }

      const { currentPassword, newPassword, confirmPassword, activeSessions, ...userData } = user;
      
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          rut: userData.rut
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Perfil actualizado", {
          description: "La información ha sido actualizada correctamente."
        });
      } else {
        toast.error("Error al actualizar el perfil", {
          description: data.message
        });
      }
    } catch (error) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      });
    } finally {
      setSaving(false);
    }
  };

  // Función para cambiar la contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user.newPassword !== user.confirmPassword) {
      toast.error("Las contraseñas no coinciden", {
        description: "La nueva contraseña y su confirmación deben ser iguales."
      });
      return;
    }

    if (user.newPassword.length < 8) {
      toast.error("Contraseña muy corta", {
        description: "La contraseña debe tener al menos 8 caracteres."
      });
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: user.currentPassword,
          newPassword: user.newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Contraseña actualizada", {
          description: "Tu contraseña ha sido actualizada correctamente."
        });
        
        // Limpiar campos de contraseña
        setUser(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      } else {
        toast.error("Error al cambiar la contraseña", {
          description: data.message
        });
      }
    } catch (error) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      });
    } finally {
      setSaving(false);
    }
  };

  // Función para cerrar una sesión específica
  const handleCloseSession = async (sessionId: string) => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/users/session/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(prev => ({
          ...prev,
          activeSessions: prev.activeSessions.filter(session => session._id !== sessionId)
        }));
        
        toast.success("Sesión cerrada", {
          description: "La sesión ha sido cerrada correctamente."
        });
      } else {
        toast.error("Error al cerrar sesión", {
          description: data.message
        });
      }
    } catch (error) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      });
    } finally {
      setSaving(false);
    }
  };

  // Función para cerrar todas las sesiones
  const handleCloseAllSessions = async () => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/users/session/close-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(prev => ({
          ...prev,
          activeSessions: []
        }));
        
        toast.success("Todas las sesiones cerradas", {
          description: "Todas las sesiones han sido cerradas correctamente."
        });
      } else {
        toast.error("Error al cerrar sesiones", {
          description: data.message
        });
      }
    } catch (error) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      });
    } finally {
      setSaving(false);
    }
  };

  // Calcular años desde el ingreso
  const yearsEnrolled = new Date().getFullYear() - user.yearOfAdmission;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <Button variant="outline" onClick={handleSaveProfile} disabled={saving || loading}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[500px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando información...</p>
            </div>
          </div>
        ) : (
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
                  <h3 className="text-lg font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.role === 'student' ? 'Estudiante' : 
                     user.role === 'teacher' ? 'Profesor' : 'Administrador'}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge>RUT: {user.rut || "Sin registrar"}</Badge>
                  </div>
                </div>
                <div className="w-full space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.program}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Ingreso {user.yearOfAdmission} ({yearsEnrolled} {yearsEnrolled === 1 ? 'año' : 'años'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.address || "Sin dirección"}</span>
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
                          <Label htmlFor="name">Nombre Completo</Label>
                          <Input 
                            id="name" 
                            name="name" 
                            placeholder="Nombre Completo" 
                            value={user.name} 
                            onChange={handleChange} 
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rut">RUT</Label>
                          <Input 
                            id="rut" 
                            name="rut" 
                            placeholder="XX.XXX.XXX-X" 
                            value={user.rut || ""} 
                            onChange={handleChange} 
                            disabled
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={user.email} 
                            onChange={handleChange} 
                            disabled 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input 
                            id="phone" 
                            name="phone" 
                            type="tel" 
                            placeholder="+56912345678" 
                            value={user.phone || ""} 
                            onChange={handleChange} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input 
                          id="address" 
                          name="address" 
                          placeholder="Calle, Número" 
                          value={user.address || ""} 
                          onChange={handleChange} 
                        />
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
                          <Label htmlFor="studentId">Matrícula</Label>
                          <Input 
                            id="studentId" 
                            name="studentId" 
                            value={user.studentId || "Sin registrar"} 
                            disabled 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="program">Programa</Label>
                          <Input 
                            id="program" 
                            name="program" 
                            value={user.program || "Sin registrar"} 
                            disabled 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="yearOfAdmission">Año de Ingreso</Label>
                          <Input 
                            id="yearOfAdmission" 
                            name="yearOfAdmission" 
                            value={user.yearOfAdmission} 
                            disabled 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Estado</Label>
                          <Input 
                            id="status" 
                            name="status" 
                            value={user.status || "Activo"} 
                            disabled 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="gpa">Promedio General</Label>
                          <Input 
                            id="gpa" 
                            name="gpa" 
                            value={user.gpa || "0.0"} 
                            disabled 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="advisor">Tutor Académico</Label>
                          <Input 
                            id="advisor" 
                            name="advisor" 
                            value={user.advisor || "N/A"} 
                            disabled 
                          />
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
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Contraseña Actual</Label>
                          <Input 
                            id="currentPassword" 
                            name="currentPassword" 
                            type="password" 
                            value={user.currentPassword}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Nueva Contraseña</Label>
                          <Input 
                            id="newPassword" 
                            name="newPassword" 
                            type="password" 
                            value={user.newPassword}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                          <Input 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            type="password" 
                            value={user.confirmPassword}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="flex items-center p-3 bg-yellow-50 text-yellow-900 rounded-md text-sm">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <p>Tu contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, un número y un carácter especial.</p>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto" 
                          disabled={saving}
                        >
                          {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Sesiones Activas</CardTitle>
                      <CardDescription>Gestiona tus dispositivos y sesiones activas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        {user.activeSessions && user.activeSessions.length > 0 ? (
                          user.activeSessions.map((session) => (
                            <div key={session._id} className="flex items-center justify-between p-4 border rounded-md">
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
                                    {session.deviceType.includes('Móvil') ? (
                                      <><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></>
                                    ) : (
                                      <><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></>
                                    )}
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium">{session.deviceName.substring(0, 30)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.location} · {new Date(session.lastActive).toLocaleString('es-ES', { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleCloseSession(session._id)}
                                disabled={saving}
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Cerrar
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-4 text-muted-foreground">
                            No hay sesiones activas
                          </div>
                        )}
                      </div>
                      
                      {user.activeSessions && user.activeSessions.length > 0 && (
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={handleCloseAllSessions}
                          disabled={saving}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Cerrar Todas las Sesiones
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}