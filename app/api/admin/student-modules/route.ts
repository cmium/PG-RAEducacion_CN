import { type NextRequest, NextResponse } from "next/server"
import pool, { query } from "@/lib/db"
import type { RowDataPacket } from "mysql2"

interface ModuleRow extends RowDataPacket {
  id_modulo: number;
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Obtener módulos asignados al estudiante
    const assignedModules = await query(
      `SELECT id_modulo 
       FROM asignacion_modulos 
       WHERE id_usuario = ?`,
      [userId]
    )

    const moduleIds = assignedModules.map((row: any) => row.id_modulo)
    return NextResponse.json({ moduleIds })
  } catch (error) {
    console.error("Error fetching student modules:", error)
    return NextResponse.json({ 
      error: "Error al obtener los módulos del estudiante" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, moduleIds } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!Array.isArray(moduleIds)) {
      return NextResponse.json({ error: "Module IDs must be an array" }, { status: 400 });
    }

    // Comenzar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Primero, eliminar asignaciones existentes
      await connection.execute('DELETE FROM asignacion_modulos WHERE id_usuario = ?', [userId]);

      // Insertar nuevas asignaciones
      for (const moduleId of moduleIds) {
        await connection.execute(
          `INSERT INTO asignacion_modulos (id_usuario, id_modulo, fecha_asignacion) 
           VALUES (?, ?, CURDATE())`,
          [userId, moduleId]
        );

        // Crear o actualizar el progreso del estudiante
        await connection.execute(
          `INSERT INTO progreso_estudiante 
           (id_usuario, id_modulo, porcentaje_progreso, completado, fecha_inicio) 
           VALUES (?, ?, 0, FALSE, CURDATE())
           ON DUPLICATE KEY UPDATE fecha_actualizacion = CURRENT_TIMESTAMP`,
          [userId, moduleId]
        );
      }

      // Confirmar transacción
      await connection.commit();
      connection.release();

      return NextResponse.json({ 
        success: true, 
        message: "Módulos asignados correctamente" 
      });

    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error("Error updating student modules:", error);
    return NextResponse.json({ 
      error: "Error al actualizar los módulos del estudiante" 
    }, { status: 500 });
  }
}
