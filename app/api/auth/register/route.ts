import { NextRequest, NextResponse } from "next/server"
import pool, { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { username, name, lastname, email, password } = await request.json()

    // Verificar si el usuario ya existe
    const existingUser = await query(
      "SELECT * FROM usuarios WHERE nombre_usuario = ? OR correo = ?",
      [username, email]
    )

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: "El usuario o correo electrónico ya está registrado" },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Fecha actual para el registro
    const currentDate = new Date().toISOString().split('T')[0]

    // Comenzar transacción
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Insertar nuevo usuario
      const [result]: any = await connection.execute(
        `INSERT INTO usuarios (
          nombre_usuario, 
          contrasena, 
          nombre, 
          apellido, 
          correo, 
          fecha_registro, 
          id_rol
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          username,          // nombre_usuario
          hashedPassword,    // contrasena
          name,             // nombre
          lastname,         // apellido
          email,            // correo
          currentDate,      // fecha_registro
          2                 // id_rol (2 para estudiantes)
        ]
      )

      const newUserId = result.insertId

      // No asignar módulos automáticamente al nuevo usuario

      // Confirmar transacción
      await connection.commit()
      connection.release()

      return NextResponse.json({ message: "Usuario registrado exitosamente" })
    } catch (error) {
      // Revertir cambios si hay error
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error: any) {
    console.error("Error en el registro:", error)
    return NextResponse.json(
      { error: "Error al crear la cuenta. Por favor intente nuevamente." },
      { status: 500 }
    )
  }
}