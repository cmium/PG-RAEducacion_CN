"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Download, TrendingUp, Users, BookOpen, Award, FileText } from "lucide-react"
// @ts-ignore
import jsPDF from "jspdf"
// @ts-ignore
import autoTable from "jspdf-autotable"

export default function ReportsView() {
  const [reports, setReports] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalModules: 0,
    avgProgress: 0,
    topStudents: [],
  })
  const [users, setUsers] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [filters, setFilters] = useState<{
    userId?: string
    moduleId?: string
    status?: "completed" | "in_progress"
    progressMin?: string
    progressMax?: string
  }>({
    userId: undefined,
    moduleId: undefined,
    status: undefined,
    progressMin: "",
    progressMax: "",
  })

  useEffect(() => {
    loadReports()
    loadFilterData()
  }, [])

  const loadFilterData = async () => {
    try {
      const [uRes, mRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/modules"),
      ])
      const uJson = await uRes.json()
      const mJson = await mRes.json()
      setUsers((uJson.users || []).filter((u: any) => u.id_rol === 2))
      setModules(mJson.modules || [])
    } catch {
      setUsers([])
      setModules([])
    }
  }

  const loadReports = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.userId) params.set("userId", filters.userId)
      if (filters.moduleId) params.set("moduleId", filters.moduleId)
      if (filters.status) params.set("status", filters.status)
      if (filters.progressMin) params.set("progressMin", filters.progressMin)
      if (filters.progressMax) params.set("progressMax", filters.progressMax)
      const url = `/api/admin/reports${params.toString() ? `?${params.toString()}` : ""}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Error al consultar reportes")
      const text = await res.text()
      if (!text) throw new Error("Respuesta vacía del servidor")
      const data = JSON.parse(text)
      setReports(data.reports)
      setStats(data.stats)
    } catch (err) {
      setReports([])
      setStats({ totalStudents: 0, totalModules: 0, avgProgress: 0, topStudents: [] })
      alert("Error al cargar reportes: " + (err as Error).message)
    }
  }

  const applyFilters = () => {
    loadReports()
  }

  const clearFilters = () => {
    setFilters({ userId: undefined, moduleId: undefined, status: undefined, progressMin: "", progressMax: "" })
    setTimeout(() => loadReports(), 0)
  }

  const exportPDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const marginX = 14
      let cursorY = 18
      const dateStr = new Date().toLocaleString()

      pdf.setFontSize(16)
      pdf.setTextColor(17, 24, 39) // gray-900
      pdf.text("Reporte de Progreso - Plataforma Educativa AR", marginX, cursorY)
      cursorY += 6

      pdf.setFontSize(10)
      pdf.setTextColor(100, 116, 139) // gray-500
      pdf.text(dateStr, marginX, cursorY)
      cursorY += 12

      // Tarjetas de estadísticas
      const cards = [
        {
          label: "Estudiantes",
          value: stats.totalStudents?.toString() ?? "0",
          color: [59, 130, 246], // blue-500
        },
        {
          label: "Módulos",
          value: stats.totalModules?.toString() ?? "0",
          color: [16, 185, 129], // emerald-500
        },
        {
          label: "Progreso Promedio",
          value: `${stats.avgProgress ?? 0}%`,
          color: [139, 92, 246], // violet-500
        },
        {
          label: "Completados",
          value: reports.filter((r) => r.completado).length.toString(),
          color: [234, 179, 8], // amber-500
        },
      ]

      const cardWidth = (pageWidth - marginX * 2 - 18) / 4
      const cardHeight = 32
      pdf.setFont("helvetica", "bold")

      cards.forEach((card, idx) => {
        const x = marginX + idx * (cardWidth + 6)
        const [r, g, b] = card.color as [number, number, number]
        // Fondo de tarjeta
        pdf.setFillColor(r, g, b)
        pdf.setDrawColor(r, g, b)
        pdf.roundedRect(x, cursorY, cardWidth, cardHeight, 3, 3, "F")
        // Contenido
        pdf.setTextColor(255, 255, 255)
        const centerX = x + cardWidth / 2
        pdf.setFontSize(10)
        pdf.text(card.label, centerX, cursorY + 12, { align: "center" })
        pdf.setFontSize(16)
        pdf.text(card.value, centerX, cursorY + 24, { align: "center" })
      })

      cursorY += cardHeight + 14

      if (reports.length === 0) {
        pdf.setTextColor(148, 163, 184) // gray-400
        pdf.setFontSize(12)
        pdf.text("No hay datos de usuarios o módulos para los filtros seleccionados.", marginX, cursorY)
        // Footer en página sin tabla
        const pageH = pdf.internal.pageSize.getHeight()
        pdf.setTextColor(100, 116, 139)
        pdf.setFontSize(9)
        pdf.text("©2025 Desarrollo - CN", pageWidth - marginX, pageH - 8, { align: "right" })
      } else {
        autoTable(pdf, {
          startY: cursorY,
          headStyles: {
            fillColor: [249, 250, 251],
            textColor: [55, 65, 81],
            fontSize: 9,
            fontStyle: "bold",
            halign: "left",
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [55, 65, 81],
            cellPadding: 3,
          },
          alternateRowStyles: {
            fillColor: [247, 250, 252],
          },
          styles: {
            lineWidth: 0.1,
            lineColor: [226, 232, 240],
          },
          didDrawPage: (data) => {
            const pageH = pdf.internal.pageSize.getHeight()
            pdf.setTextColor(100, 116, 139)
            pdf.setFontSize(9)
            pdf.text("©2025 Desarrollo - CN", pageWidth - marginX, pageH - 8, { align: "right" })
          },
          head: [[
            "Estudiante",
            "Módulo",
            "Progreso",
            "Estado",
            "Última actualización",
          ]],
          body: reports.map((r) => [
            `${r.nombre} ${r.apellido}`,
            r.modulo,
            `${r.porcentaje_progreso || 0}%`,
            r.completado ? "Completado" : "En progreso",
            r.fecha_actualizacion
              ? new Date(r.fecha_actualizacion).toLocaleDateString()
              : "-",
          ]),
        })
      }

      pdf.save(`reporte_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (err) {
      alert("Error al exportar PDF: " + (err as Error).message)
    }
  }

  const exportReports = () => {
    const csv = [
      ["Estudiante", "Módulo", "Progreso", "Completado", "Fecha Actualización"],
      ...reports.map((r) => [
        `${r.nombre} ${r.apellido}`,
        r.modulo,
        `${r.porcentaje_progreso}%`,
        r.completado ? "Sí" : "No",
        new Date(r.fecha_actualizacion).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Usuario</label>
            <Select
              value={filters.userId ?? undefined}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, userId: v === "all" ? undefined : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id_usuario} value={String(u.id_usuario)}>
                    {u.nombre} {u.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Módulo</label>
            <Select
              value={filters.moduleId ?? undefined}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, moduleId: v === "all" ? undefined : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {modules.map((m) => (
                  <SelectItem key={m.id_modulo} value={String(m.id_modulo)}>
                    {m.nombre_modulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Estado</label>
            <Select
              value={filters.status ?? undefined}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  status: v === "all" ? undefined : (v as "completed" | "in_progress"),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">% Progreso (min)</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={filters.progressMin || ""}
              onChange={(e) => setFilters((f) => ({ ...f, progressMin: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">% Progreso (max)</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={filters.progressMax || ""}
              onChange={(e) => setFilters((f) => ({ ...f, progressMax: e.target.value }))}
              placeholder="100"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 justify-end">
          <Button variant="outline" onClick={clearFilters}>Limpiar</Button>
          <Button onClick={applyFilters}>Aplicar filtros</Button>
        </div>
      </Card>

      {/* Stats Cards y gráficos para PDF */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estudiantes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Módulos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalModules}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progreso Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-gray-900">{reports.filter((r) => r.completado).length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Export Button */}
      <div className="flex justify-end gap-2">
        <Button onClick={exportReports} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
        <Button onClick={exportPDF} className="gap-2" variant="outline">
          <FileText className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Reports Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Act.</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">No hay datos de usuarios o módulos.</td>
                </tr>
              ) : (
                reports.map((report, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {report.nombre} {report.apellido}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{report.modulo}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Progress value={report.porcentaje_progreso || 0} className="w-24" />
                        <span className="text-sm text-gray-600">{report.porcentaje_progreso || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {report.completado ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Completado
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          En progreso
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.fecha_actualizacion ? new Date(report.fecha_actualizacion).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
