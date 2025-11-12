import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams
  const filterUserId = search.get("userId")
  const filterModuleId = search.get("moduleId")
  const filterStatus = search.get("status") // 'completed' | 'in_progress'
  const progressMin = search.get("progressMin")
  const progressMax = search.get("progressMax")

  // Consulta real: usuarios, módulos y progreso
  // 1. Obtener todos los estudiantes
  const students = await query(
    `SELECT id_usuario, nombre, apellido
     FROM usuarios
     WHERE id_rol = 2
     ${filterUserId ? "AND id_usuario = ?" : ""}`,
    filterUserId ? [Number(filterUserId)] : []
  )
  // 2. Obtener todos los módulos
  const modules = await query(
    `SELECT id_modulo, nombre_modulo
     FROM modulos
     ${filterModuleId ? "WHERE id_modulo = ?" : ""}`,
    filterModuleId ? [Number(filterModuleId)] : []
  )
  // 3. Obtener progreso de todos los estudiantes en todos los módulos
  const progress = await query(
    `SELECT p.id_usuario, p.id_modulo, p.completado, p.porcentaje_progreso, p.fecha_actualizacion
     FROM progreso_estudiante p`
  )

  // 4. Armar reportes
  let reports = []
  for (const student of students as any[]) {
    for (const module of modules as any[]) {
      const prog = (progress as any[]).find(
        (p) => p.id_usuario === student.id_usuario && p.id_modulo === module.id_modulo
      )
      reports.push({
        id_usuario: student.id_usuario,
        nombre: student.nombre,
        apellido: student.apellido,
        modulo: module.nombre_modulo,
        porcentaje_progreso: prog ? Number(prog.porcentaje_progreso ?? 0) : 0,
        completado: prog ? !!prog.completado : false,
        fecha_actualizacion: prog ? prog.fecha_actualizacion : null,
      })
    }
  }

  // 4.1 Aplicar filtros de estado y progreso si vienen en query
  if (filterStatus === "completed") {
    reports = reports.filter((r: any) => r.completado === true)
  } else if (filterStatus === "in_progress") {
    reports = reports.filter((r: any) => r.completado === false)
  }
  if (progressMin !== null && progressMin !== undefined && progressMin !== "") {
    const min = Number(progressMin)
    reports = reports.filter((r: any) => (r.porcentaje_progreso || 0) >= min)
  }
  if (progressMax !== null && progressMax !== undefined && progressMax !== "") {
    const max = Number(progressMax)
    reports = reports.filter((r: any) => (r.porcentaje_progreso || 0) <= max)
  }

  // 5. Stats
  const totalStudents = (students as any[]).length
  const totalModules = (modules as any[]).length
  const avgProgress = reports.length > 0
    ? Math.round(
        reports.reduce((acc, r) => acc + Number(r.porcentaje_progreso || 0), 0) / reports.length
      )
    : 0

  const stats = {
    totalStudents,
    totalModules,
    avgProgress,
    topStudents: [],
  }

  return NextResponse.json({ reports, stats })
}
