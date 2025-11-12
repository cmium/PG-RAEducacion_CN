"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Search, KeyRound, CheckCircle2, XCircle } from "lucide-react"

export default function UsersManagement() {


  // --- Solicitudes de cambio de contraseña ---
  type PasswordRequest = {
    id: number
    email: string
    status: string
    created_at: string
  }
  const [passwordRequests, setPasswordRequests] = useState<PasswordRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const { toast } = require("@/hooks/use-toast")

  const loadPasswordRequests = async () => {
    setLoadingRequests(true)
    const res = await fetch("/api/admin/password-requests")
    if (res.ok) {
      const data = await res.json()
      setPasswordRequests(data)
    }
    setLoadingRequests(false)
  }

  useEffect(() => {
    loadPasswordRequests()
  }, [])

  const handlePasswordRequestAction = async (id: number, action: "approved" | "rejected") => {
    const res = await fetch("/api/admin/password-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      toast({
        title: action === "approved" ? "Solicitud aprobada" : "Solicitud rechazada",
        description: action === "approved"
          ? "La contraseña del usuario ha sido actualizada."
          : "La solicitud fue rechazada.",
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud.",
        variant: "destructive",
      })
    }
    loadPasswordRequests()
  }

  // --- Usuarios ---
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    contrasena: "",
    nombre: "",
    apellido: "",
    correo: "",
    id_rol: 2,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const res = await fetch("/api/admin/users")
    const data = await res.json()
    setUsers(data.users)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingUser ? `/api/admin/users/${editingUser.id_usuario}` : "/api/admin/users"

    const method = editingUser ? "PUT" : "POST"

    const payload = {
      ...formData,
      id_rol: Number(formData.id_rol),
    }
    if (editingUser && !payload.contrasena) {
      delete (payload as any).contrasena
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      toast({
        title: editingUser ? "Usuario actualizado" : "Usuario creado",
        description: editingUser
          ? "Se guardaron los cambios del usuario."
          : "El usuario fue agregado correctamente.",
      })
    } else {
      const error = await res.json().catch(() => ({}))
      toast({
        title: "Error",
        description: error?.error ?? "No se pudo completar la acción.",
        variant: "destructive",
      })
      return
    }

    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({
      nombre_usuario: "",
      contrasena: "",
      nombre: "",
      apellido: "",
      correo: "",
      id_rol: 2,
    })
    loadUsers()
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setFormData({
      nombre_usuario: user.nombre_usuario,
      contrasena: "",
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      id_rol: user.id_rol,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast({
          title: "Usuario eliminado",
          description: "El usuario fue eliminado correctamente.",
        })
        loadUsers()
      } else {
        const error = await res.json().catch(() => ({}))
        toast({
          title: "Error",
          description: error?.error ?? "No se pudo eliminar el usuario.",
          variant: "destructive",
        })
      }
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(search.toLowerCase()) ||
      user.apellido.toLowerCase().includes(search.toLowerCase()) ||
      user.nombre_usuario.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      {/* Solicitudes de cambio de contraseña */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><KeyRound className="w-5 h-5" /> Solicitudes de cambio de contraseña</h2>
        <div className="bg-white rounded-xl shadow p-4">
          {loadingRequests ? (
            <div className="text-gray-500">Cargando solicitudes...</div>
          ) : passwordRequests.length === 0 ? (
            <div className="text-gray-500">No hay solicitudes pendientes.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Correo</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Acción</th>
                </tr>
              </thead>
              <tbody>
                {passwordRequests.map((req) => (
                  <tr key={req.id} className="border-b">
                    <td className="px-4 py-2">{req.email}</td>
                    <td className="px-4 py-2">{new Date(req.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handlePasswordRequestAction(req.id, "approved")}
                        className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 flex gap-1 items-center">
                        <CheckCircle2 className="w-4 h-4" /> Aprobar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePasswordRequestAction(req.id, "rejected")}
                        className="text-red-700 border-red-300 hover:bg-red-50 flex gap-1 items-center">
                        <XCircle className="w-4 h-4" /> Rechazar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Actions Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre_usuario">Usuario</Label>
                <Input
                  id="nombre_usuario"
                  value={formData.nombre_usuario}
                  onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contrasena">Contraseña {editingUser && "(dejar vacío para mantener)"}</Label>
                <Input
                  id="contrasena"
                  type="password"
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="correo">Correo</Label>
                <Input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="id_rol">Rol</Label>
                <select
                  id="id_rol"
                  value={formData.id_rol}
                  onChange={(e) => setFormData({ ...formData, id_rol: Number.parseInt(e.target.value) })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value={1}>Administrador</option>
                  <option value={2}>Estudiante</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingUser ? "Actualizar" : "Crear"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id_usuario} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.nombre_usuario}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.nombre} {user.apellido}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.correo}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.id_rol === 1 ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.id_rol === 1 ? "Admin" : "Estudiante"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id_usuario)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
