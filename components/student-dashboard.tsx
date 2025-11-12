"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LogOut, Palette, Shapes, Cat, QrCode, CheckCircle2, Circle, Download, FileText } from "lucide-react"
// @ts-ignore
import jsPDF from "jspdf"
// @ts-ignore
import autoTable from "jspdf-autotable"

interface Module {
  id_modulo: number
  nombre_modulo: string
  descripcion_modulo: string
  imagen_url: string
  qr_code_url: string
  icon: any
  color: string
}

export default function StudentDashboard({ user }: { user: any }) {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [progress, setProgress] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModulesAndProgress()
  }, [])

  const loadModulesAndProgress = async () => {
    try {
      // Cargar módulos habilitados
      const modulesRes = await fetch(`/api/student/modules?userId=${user.id}`)
      const modulesData = await modulesRes.json()

      // Cargar progreso
      const progressRes = await fetch(`/api/student/progress?userId=${user.id}`)
      const progressData = await progressRes.json()

      setModules(modulesData.modules)
      setProgress(progressData.progress)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const toggleCompletion = async (moduleId: number) => {
    try {
      const isCompleted = progress[moduleId]?.completado || false

      await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          moduleId,
          completed: !isCompleted,
        }),
      })

      // Recargar progreso
      loadModulesAndProgress()
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const getIcon = (moduleName: string) => {
    if (moduleName.toLowerCase().includes("color")) return Palette
    if (moduleName.toLowerCase().includes("forma")) return Shapes
    if (moduleName.toLowerCase().includes("animal")) return Cat
    return Circle
  }

  const getColor = (moduleName: string) => {
    if (moduleName.toLowerCase().includes("color")) return "from-pink-500 to-purple-600"
    if (moduleName.toLowerCase().includes("forma")) return "from-blue-500 to-cyan-600"
    if (moduleName.toLowerCase().includes("animal")) return "from-green-500 to-emerald-600"
    return "from-gray-500 to-gray-600"
  }

  const calculateProgress = () => {
    if (modules.length === 0) return 0
    const completed = Object.values(progress).filter((p: any) => p?.completado).length
    return Math.round((completed / modules.length) * 100)
  }

  const exportStudentReport = () => {
    try {
      const doc = new jsPDF("p", "mm", "a4")
      const pageWidth = doc.internal.pageSize.getWidth()
      const marginX = 20
      let cursorY = 24
      const fullName = `${user.nombre} ${user.apellido}`.trim()
      const today = new Date()

      doc.setFontSize(18)
      doc.setTextColor(16, 185, 129) // emerald tone
      doc.text("Certificado de Progreso", pageWidth / 2, cursorY, { align: "center" })
      cursorY += 12

      doc.setDrawColor(16, 185, 129)
      doc.setLineWidth(0.6)
      doc.line(marginX, cursorY, pageWidth - marginX, cursorY)
      cursorY += 12

      doc.setTextColor(55, 65, 81)
      doc.setFontSize(12)
      doc.text(`Estudiante: ${fullName || user.username || "-"}`, marginX, cursorY)
      cursorY += 8
      doc.text(`Fecha de emisión: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, marginX, cursorY)
      cursorY += 8
      doc.text(`Progreso general: ${calculateProgress()}%`, marginX, cursorY)
      cursorY += 14

      doc.setTextColor(100, 116, 139)
      doc.setFontSize(11)
      doc.text(
        "Detalle de avances por módulo:",
        marginX,
        cursorY
      )
      cursorY += 6

      const tableData = modules.map((module) => {
        const prog = progress[module.id_modulo] || {}
        return [
          module.nombre_modulo,
          prog.porcentaje != null ? `${Math.round(prog.porcentaje)}%` : prog.completado ? "100%" : "0%",
          prog.completado ? "Completado" : "En progreso",
          prog.fecha_actualizacion
            ? new Date(prog.fecha_actualizacion).toLocaleDateString()
            : "-",
        ]
      })

      autoTable(doc, {
        startY: cursorY,
        headStyles: {
          fillColor: [236, 253, 245], // light emerald
          textColor: [16, 95, 64],
          fontSize: 10,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          textColor: [55, 65, 81],
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        styles: {
          cellPadding: 4,
          lineWidth: 0.1,
          lineColor: [209, 213, 219],
        },
        head: [["Módulo", "Progreso", "Estado", "Última actualización"]],
        body: tableData,
      })

      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(9)
      doc.setTextColor(107, 114, 128)
      doc.text(
        "Este reporte fue generado desde la cuenta del estudiante.",
        marginX,
        pageHeight - 18
      )
      doc.text("©2025 Desarrollo - CN", pageWidth - marginX, pageHeight - 12, {
        align: "right",
      })

      const fileName = `certificado_${fullName.replace(/\s+/g, "_") || user.username}_${today
        .toISOString()
        .split("T")[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error("Error al generar el certificado:", error)
      alert("No se pudo generar el certificado. Intenta nuevamente.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mi Aprendizaje AR</h1>
              <p className="text-sm text-gray-600">¡Hola, {user.nombre}!</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Salir
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <Button
            variant="outline"
            className="gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            onClick={exportStudentReport}
            disabled={modules.length === 0}
          >
            <FileText className="h-4 w-4" />
            Descargar certificado
          </Button>
        </div>

        {/* Progress Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <h2 className="text-xl font-bold mb-4">Tu Progreso</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Módulos completados</span>
              <span className="font-bold">
                {Object.values(progress).filter((p: any) => p?.completado).length} / {modules.length}
              </span>
            </div>
            {/* Barra de progreso con color visible */}
            <div className="relative w-full h-3 rounded-full bg-white/30 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                style={{
                  width: calculateProgress() + "%",
                  background: "linear-gradient(90deg, #fbbf24 0%, #22d3ee 100%)"
                }}
              />
            </div>
            <p className="text-sm text-white/90">{calculateProgress()}% completado</p>
          </div>
        </Card>

        {/* Modules Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Módulos</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando módulos...</p>
            </div>
          ) : modules.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-600">No tienes módulos asignados todavía.</p>
              <p className="text-sm text-gray-500 mt-2">Contacta a tu profesor para que te asigne módulos.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const Icon = getIcon(module.nombre_modulo)
                const isCompleted = progress[module.id_modulo]?.completado || false

                return (
                  <Card key={module.id_modulo} className="overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Card Header with Icon */}
                    <div className={`bg-gradient-to-r ${getColor(module.nombre_modulo)} p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-12 h-12" />
                        <button
                          onClick={() => toggleCompletion(module.id_modulo)}
                          className="hover:scale-110 transition-transform relative"
                          aria-label={isCompleted ? "Marcar como incompleto" : "Marcar como completado"}
                        >
                          {isCompleted ? (
                            <span className="inline-block animate-bounce">
                              <CheckCircle2 className="w-8 h-8 text-lime-300 drop-shadow-lg" />
                            </span>
                          ) : (
                            <Circle className="w-8 h-8 text-white/70" />
                          )}
                        </button>
                      </div>
                      <h3 className="text-2xl font-bold">{module.nombre_modulo}</h3>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">{module.descripcion_modulo}</p>


                      {/* QR Code Section o embed8 para 'Aprender Formas' */}
                      {module.nombre_modulo.toLowerCase().includes("forma") ? (
                        <div className="text-center">
                          <img src="/qr/formas-ar.png" alt="QR RA Formas" className="w-full h-40 object-contain mx-auto mb-3" />
                          <div className="flex justify-center mb-2">
                            <a href="https://drive.google.com/drive/folders/1YGr_sa3EGvxOXiMv0vliwK1GQicXkpof?usp=sharing" target="_blank" rel="noopener noreferrer" title="Descargar targets de figuras" className="inline-flex items-center gap-1 text-emerald-700 hover:underline text-sm font-medium">
                              <Download className="w-4 h-4" /> Descargar targets
                            </a>
                          </div>
                          <p className="text-xs text-gray-600 font-medium">Escanea el código QR para la actividad RA</p>
                        </div>
                      ) : module.nombre_modulo.toLowerCase().includes("animal") ? (
                        <div className="text-center">
                          <img src="/qr/animales-ar.png" alt="QR RA Animales" className="w-full h-40 object-contain mx-auto mb-3" />
                          <div className="flex justify-center mb-2">
                            <a href="https://drive.google.com/drive/folders/1z02MNBmynkJ12qRV1NeyzLNh02XJ7KiA?usp=sharing" target="_blank" rel="noopener noreferrer" title="Descargar targets de animales" className="inline-flex items-center gap-1 text-emerald-700 hover:underline text-sm font-medium">
                              <Download className="w-4 h-4" /> Descargar targets
                            </a>
                          </div>
                          <p className="text-xs text-gray-600 font-medium">Escanea el código QR para la actividad RA</p>
                        </div>
                      ) : module.nombre_modulo.toLowerCase().includes("color") ? (
                        <div className="text-center">
                          <img src="/qr/colores-ar.png" alt="QR RA Colores" className="w-full h-40 object-contain mx-auto mb-3" />
                          <div className="flex justify-center mb-2">
                            <a href="https://drive.google.com/drive/folders/1J1vUhdtk1go9i5clypFVnWNc7iZ33P5g?usp=sharing" target="_blank" rel="noopener noreferrer" title="Descargar targets de colores" className="inline-flex items-center gap-1 text-emerald-700 hover:underline text-sm font-medium">
                              <Download className="w-4 h-4" /> Descargar targets
                            </a>
                          </div>
                          <p className="text-xs text-gray-600 font-medium">Escanea el código QR para la actividad RA</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center border-2 border-gray-200">
                            <QrCode className="w-16 h-16 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600 font-medium">Escanea para ver en RA</p>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="mt-4">
                        {isCompleted ? (
                          <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium text-center">
                            ✓ Completado
                          </div>
                        ) : (
                          <div className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg text-sm font-medium text-center">
                            En progreso
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
