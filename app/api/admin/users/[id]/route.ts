import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query, queryOne } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = Number.parseInt(id)
    const payload = await request.json()

    const existingUser = await queryOne(
      `SELECT id_usuario FROM usuarios WHERE id_usuario = ?`,
      [userId]
    )
    if (!existingUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (payload.nombre_usuario || payload.correo) {
      const duplicates = await query(
        `SELECT id_usuario FROM usuarios WHERE (nombre_usuario = ? OR correo = ?) AND id_usuario <> ?`,
        [payload.nombre_usuario ?? "", payload.correo ?? "", userId]
      )
      if (Array.isArray(duplicates) && duplicates.length > 0) {
        return NextResponse.json(
          { error: "El usuario o correo ya está en uso" },
          { status: 400 }
        )
      }
    }

    const fields: string[] = []
    const values: any[] = []

    const allowedFields: Record<string, string> = {
      nombre_usuario: "nombre_usuario",
      nombre: "nombre",
      apellido: "apellido",
      correo: "correo",
      id_rol: "id_rol",
    }

    for (const key of Object.keys(allowedFields)) {
      if (payload[key] !== undefined) {
        fields.push(`${allowedFields[key]} = ?`)
        values.push(
          key === "id_rol" ? Number(payload[key]) : payload[key]
        )
      }
    }

    if (payload.contrasena) {
      const hashed = await bcrypt.hash(payload.contrasena, 10)
      fields.push("contrasena = ?")
      values.push(hashed)
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No hay cambios para actualizar" }, { status: 400 })
    }

    values.push(userId)
    await query(
      `UPDATE usuarios SET ${fields.join(", ")} WHERE id_usuario = ?`,
      values
    )

    const updatedUser = await queryOne(
      `SELECT id_usuario, nombre_usuario, nombre, apellido, correo, fecha_registro, id_rol
       FROM usuarios WHERE id_usuario = ?`,
      [userId]
    )

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = Number.parseInt(id)

    await query(`DELETE FROM usuarios WHERE id_usuario = ?`, [userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}
