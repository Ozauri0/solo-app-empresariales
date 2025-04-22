import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
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
            <form>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="ejemplo@pnm.edu" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" />
                </div>
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full bg-slate-800 hover:bg-slate-700">Iniciar Sesión</Button>
                </Link>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <Link href="#" className="text-slate-800 hover:underline">
                ¿Olvidaste tu contraseña?
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
    </div>
  )
}
