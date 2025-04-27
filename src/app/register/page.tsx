'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'student'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario')
      }

      // Si el registro es exitoso, guardar el token y redirigir al dashboard
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Mostrar mensaje de éxito con toast
      toast.success('Registro exitoso', {
        description: 'Tu cuenta ha sido creada correctamente. Redirigiendo...'
      })
      
      // Pequeña pausa para mostrar el toast
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: any) {
      console.error('Error de registro:', err)
      
      // Mostrar mensaje de error con toast
      toast.error('Error de registro', {
        description: err.message || 'No se pudo completar el registro',
        icon: <AlertCircle className="h-5 w-5" />
      })
      
      // Efecto de sacudida para el formulario cuando hay un error
      const form = document.querySelector('form')
      if (form) {
        form.classList.add('shake')
        setTimeout(() => {
          form.classList.remove('shake')
        }, 500)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
      <div className="w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">LP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Campus Virtual LearnPro</h1>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Crear una cuenta</CardTitle>
            <CardDescription>Complete el formulario para registrarse en nuestra plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Juan Pérez" 
                    required 
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <Input 
                    id="username" 
                    name="username" 
                    placeholder="juan123" 
                    required 
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="ejemplo@pnm.edu" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="teacher">Profesor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-slate-800 hover:bg-slate-700"
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrarse'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/" className="text-slate-800 hover:underline">
                Iniciar Sesión
              </Link>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Al registrarte, aceptas nuestros términos y condiciones.
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 LearnPro Campus Virtual. Todos los derechos reservados.</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  )
}