'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    rut: '',
    role: 'student' // Siempre será estudiante por defecto
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'rut') {
      // Eliminar todos los caracteres no numéricos
      const numericValue = value.replace(/\D/g, '')
      
      // Aplicar formato solo si hay contenido
      if (numericValue) {
        // Formatear RUT (ej: 123456789 -> 12.345.678-9)
        setFormData(prev => ({
          ...prev,
          rut: formatRut(numericValue)
        }))
      } else {
        // Si está vacío, limpiarlo
        setFormData(prev => ({
          ...prev,
          rut: ''
        }))
      }
    } else {
      // Para el resto de los campos, comportamiento normal
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Función para formatear RUT (ej: 123456789 -> 12.345.678-9)
  const formatRut = (rut: string) => {
    // Obtener dígito verificador
    const dv = rut.slice(-1)
    // Obtener el cuerpo del RUT sin el dígito verificador
    let rutBody = rut.slice(0, -1)
    
    // Formatear con puntos
    let formattedRut = ''
    for (let i = rutBody.length - 1, j = 0; i >= 0; i--, j++) {
      formattedRut = rutBody.charAt(i) + formattedRut
      if (j === 2 && i !== 0) {
        formattedRut = '.' + formattedRut
        j = -1
      }
    }
    
    // Retornar RUT con formato completo
    return `${formattedRut}-${dv}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Verificar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden', {
        description: 'Por favor, verifica que ambas contraseñas sean iguales',
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
      
      return
    }

    setLoading(true)

    try {
      // Crear el objeto a enviar (sin confirmPassword)
      const { confirmPassword, ...dataToSend } = formData
      
      // Crear el objeto de datos a enviar con username
      const registerData = {
        ...dataToSend,
        username: formData.email
      }

      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
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
            <CardDescription>Complete el formulario para registrarse como estudiante</CardDescription>
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
                  <Label htmlFor="rut">RUT</Label>
                  <Input 
                    id="rut" 
                    name="rut" 
                    placeholder="12.345.678-9" 
                    required 
                    value={formData.rut}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingrese solo números (ej: 123456789)
                  </p>
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
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    required 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
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