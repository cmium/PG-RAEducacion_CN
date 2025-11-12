
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query, queryOne } from "@/lib/db"

export async function GET() {
  try {
    const users = await query(
      `SELECT id_usuario, nombre_usuario, nombre, apellido, correo, fecha_registro, id_rol FROM usuarios`
    )
    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nombre_usuario,
      contrasena,
      nombre,
      apellido,
      correo,
      id_rol = 2,
    } = body

    if (!nombre_usuario || !contrasena || !nombre || !apellido || !correo) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      )
    }

    const existing = await query(
      `SELECT id_usuario FROM usuarios WHERE nombre_usuario = ? OR correo = ?`,
      [nombre_usuario, correo]
    )
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: "El usuario o correo ya está registrado" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10)
    const currentDate = new Date().toISOString().split("T")[0]

    const result: any = await query(
      `INSERT INTO usuarios (nombre_usuario, contrasena, nombre, apellido, correo, fecha_registro, id_rol)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre_usuario, hashedPassword, nombre, apellido, correo, currentDate, Number(id_rol)]
    )

    const newUser = await queryOne(
      `SELECT id_usuario, nombre_usuario, nombre, apellido, correo, fecha_registro, id_rol
       FROM usuarios WHERE id_usuario = ?`,
      [result.insertId]
    )

    return NextResponse.json({ success: true, user: newUser }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}
