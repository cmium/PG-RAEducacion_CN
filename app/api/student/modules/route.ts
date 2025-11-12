import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Se requiere ID de usuario" }, { status: 400 })
    }

    // Obtener solo los módulos asignados al estudiante
    const assignedModules = await query(
      `SELECT m.* 
       FROM modulos m
       INNER JOIN asignacion_modulos am ON m.id_modulo = am.id_modulo
       WHERE am.id_usuario = ?
       ORDER BY m.nombre_modulo`,
      [userId]
    )

    return NextResponse.json({ modules: assignedModules })
  } catch (error) {
    console.error("Error obteniendo módulos del estudiante:", error)
    return NextResponse.json(
      { error: "Error al obtener los módulos asignados" },
      { status: 500 }
    )
  }
}
