"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export default function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState("")

  const checkPasswordStrength = (password: string) => {
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      setPasswordStrength("Excelente - Contraseña muy segura")
      return true
    }
    setPasswordStrength("")
    return false
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      username: formData.get("username"),
      name: formData.get("name"),
      lastname: formData.get("lastname"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    }

    if (data.password !== data.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (!checkPasswordStrength(data.password as string)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al crear la cuenta")
      }

      toast({
        description: "¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...",
        className: "bg-emerald-500 text-white",
      })

      // Esperar un momento para mostrar el toast antes de redirigir
      setTimeout(() => {
        router.push("/login?registered=true")
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 p-4">
      <Card className="w-full max-w-md p-6 bg-white shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">¡Crear Cuenta!</h1>
          <p className="text-gray-600 mt-2">Únete a nuestra plataforma educativa AR</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              name="username"
              placeholder="Usuario"
              required
              className="w-full"
            />
          </div>

          <div>
            <Input
              type="text"
              name="name"
              placeholder="Nombre"
              required
              className="w-full"
            />
          </div>

          <div>
            <Input
              type="text"
              name="lastname"
              placeholder="Apellido"
              required
              className="w-full"
            />
          </div>

          <div>
            <Input
              type="email"
              name="email"
              placeholder="Correo Electrónico"
              required
              className="w-full"
            />
          </div>

          <div>
            <Input
              type="password"
              name="password"
              placeholder="Contraseña"
              required
              className="w-full"
              onChange={(e) => checkPasswordStrength(e.target.value)}
            />
            {passwordStrength && (
              <p className="text-sm text-emerald-600 mt-1">{passwordStrength}</p>
            )}
          </div>

          <div>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar Contraseña"
              required
              className="w-full"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-700">
              Inicia sesión
            </Link>
          </p>
        </form>
      </Card>
    </div>
  )
}