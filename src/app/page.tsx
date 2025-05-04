'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      router.push('/dashboard')
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        // Manejo de errores sin lanzar excepciones
        let errorMessage = data.message || 'Error al iniciar sesión'
        if (response.status === 401) {
          errorMessage = 'Correo electrónico o contraseña incorrectos'
        }
        
        // Mostrar mensaje de error con toast
        toast.error('Error de inicio de sesión', {
          description: errorMessage,
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
        
        // Terminar la ejecución aquí sin lanzar excepción
        setLoading(false)
        return
      }

      // Si el login es exitoso, guardar el token y redirigir al dashboard
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Mostrar mensaje de éxito con toast
      toast.success('Inicio de sesión exitoso', {
        description: 'Redirigiendo al dashboard...'
      })
      
      // Pequeña pausa para mostrar el toast antes de redirigir
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } catch (err: any) {
      console.error('Error de login:', err)
      
      // Manejar errores de red o excepciones inesperadas
      toast.error('Error de inicio de sesión', {
        description: 'Error de conexión. Intente nuevamente más tarde.',
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
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
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
                    autoComplete="email"
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
                    autoComplete="current-password"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-slate-800 hover:bg-slate-700"
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <Link href="#" className="text-slate-800 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="text-sm text-center">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-slate-800 hover:underline">
                Regístrate aquí
              </Link>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Al iniciar sesión, aceptas nuestros términos y condiciones.
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
