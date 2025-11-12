"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Users, BookOpen, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import UsersManagement from "@/components/admin/users-management"
import ModulesManagement from "@/components/admin/modules-management"
import ReportsView from "@/components/admin/reports-view"


type Tab = "users" | "modules" | "reports"

export default function AdminDashboard({ user }: { user: any }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("users")

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👨‍💼</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
              <p className="text-sm text-gray-600">Bienvenido, {user.nombre}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Salir
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-8 flex gap-2">
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            onClick={() => setActiveTab("users")}
            className="flex-1 gap-2"
          >
            <Users className="w-4 h-4" />
            Usuarios
          </Button>
          <Button
            variant={activeTab === "modules" ? "default" : "ghost"}
            onClick={() => setActiveTab("modules")}
            className="flex-1 gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Módulos
          </Button>
          <Button
            variant={activeTab === "reports" ? "default" : "ghost"}
            onClick={() => setActiveTab("reports")}
            className="flex-1 gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Reportes
          </Button>
        </div>

        {/* Content */}
        <div>
          {activeTab === "users" && <UsersManagement />}
          {activeTab === "modules" && <ModulesManagement />}
          {activeTab === "reports" && <ReportsView />}
        </div>
      </div>
    </div>
  )
}
