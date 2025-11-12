import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const rows: any = await query(
      `SELECT id_modulo, completado, porcentaje_progreso, fecha_actualizacion
       FROM progreso_estudiante
       WHERE id_usuario = ?`,
      [Number(userId)]
    )

    const progress: Record<number, any> = {}
    for (const r of rows as any[]) {
      progress[r.id_modulo] = {
        completado: !!r.completado,
        porcentaje: Number(r.porcentaje_progreso ?? 0),
        fecha_actualizacion: r.fecha_actualizacion,
      }
    }

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Error fetching progress" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, moduleId, completed } = await request.json()

    if (!userId || !moduleId || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "userId, moduleId y completed son requeridos" },
        { status: 400 }
      )
    }

    const porcentaje = completed ? 100 : 50

    await query(
      `INSERT INTO progreso_estudiante (id_usuario, id_modulo, porcentaje_progreso, completado, fecha_inicio)
       VALUES (?, ?, ?, ?, CURDATE())
       ON DUPLICATE KEY UPDATE
         porcentaje_progreso = VALUES(porcentaje_progreso),
         completado = VALUES(completado),
         fecha_actualizacion = CURRENT_TIMESTAMP`,
      [Number(userId), Number(moduleId), porcentaje, completed ? 1 : 0]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json({ error: "Error updating progress" }, { status: 500 })
  }
}
