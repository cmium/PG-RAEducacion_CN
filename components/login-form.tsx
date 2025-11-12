"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { GraduationCap, User, Lock, LogIn, UserPlus, KeyRound } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("registered") === "true") {
      toast({
        description: "¡Cuenta creada exitosamente! Ya puedes iniciar sesión.",
        className: "bg-emerald-500 text-white",
      })
      router.replace("/login")
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(data.message || "Error al iniciar sesión")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500" />
      <div className="px-10 pb-10 pt-12">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="mb-3 text-center text-3xl font-bold text-gray-800">¡Bienvenido!</h1>
        <p className="mb-10 text-center text-gray-600">Accede a tu plataforma educativa AR</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Ingresa tu usuario"
                className="h-12 rounded-xl border-emerald-200 pl-12 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresa tu contraseña"
                className="h-12 rounded-xl border-gray-300 pl-12 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-semibold text-white transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-8 space-y-3 text-center">
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="mx-auto flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
          >
            <KeyRound className="h-4 w-4" />
            ¿Olvidaste tu contraseña?
          </button>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="mx-auto flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
          >
            <UserPlus className="h-4 w-4" />
            Crear nueva cuenta
          </button>
        </div>
      </div>
    </div>
  )
}
