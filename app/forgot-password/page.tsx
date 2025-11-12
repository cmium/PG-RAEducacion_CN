"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KeyRound } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [sent, setSent] = useState(false)
  const [requestStatus, setRequestStatus] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Consultar estado de la solicitud si ya fue enviada
  useEffect(() => {
    if (sent && email) {
      fetch(`/api/admin/password-requests?email=${encodeURIComponent(email)}`)
        .then(async res => {
          if (!res.ok) return null
          try {
            return await res.json()
          } catch {
            return null
          }
        })
        .then(data => {
          if (data && data.status && data.status !== 'pending') {
            setRequestStatus(data.status)
            toast({
              title: data.status === 'approved' ? 'Solicitud aprobada' : 'Solicitud rechazada',
              description: data.status === 'approved'
                ? 'Tu contraseña ha sido restablecida. Ya puedes iniciar sesión.'
                : 'Tu solicitud fue rechazada por el administrador.',
            })
          }
        })
    }
  }, [sent, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password || !confirmPassword) {
      setError("Completa todos los campos.")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/password-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        setError("No se pudo enviar la solicitud. Intenta de nuevo.")
        setLoading(false)
        return
      }
      setSent(true)
      setLoading(false)
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de cambio de contraseña está pendiente de aprobación del administrador.",
      })
      setTimeout(() => {
        router.replace("/login")
      }, 1500)
    } catch (err) {
      setError("Error de red. Intenta de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 mx-auto mt-16">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <KeyRound className="w-9 h-9 text-white" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Recuperar contraseña</h1>
      <p className="text-center text-gray-600 mb-8">Ingresa tu datos y se estará notifcando al administrador para restablecer tu contraseña.</p>
      {sent ? (
        
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm text-center">
          Tu solicitud de cambio de contraseña está pendiente de aprobación del administrador.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              className="h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Nueva contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Repite la contraseña
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Solicitar cambio
          </Button>
        </form>
      )}
    </div>
  )
}
