import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Buscar usuario y su rol en la base de datos
    const users = await query(
      `SELECT u.*, r.nombre_rol as rol 
       FROM usuarios u 
       JOIN roles r ON u.id_rol = r.id_rol 
       WHERE u.nombre_usuario = ?`,
      [username]
    ) as any[]

    const user = users[0]

    if (!user) {
      return NextResponse.json({ message: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    // Verificar si la contraseña está hasheada (comienza con $2a$ o $2b$ de bcrypt)
    const isHashed = user.contrasena.startsWith('$2')
    
    // Validar contraseña
    let isValidPassword = false
    if (isHashed) {
      // Para usuarios nuevos con contraseña hasheada
      isValidPassword = await bcrypt.compare(password, user.contrasena)
    } else {
      // Para usuarios existentes con contraseña en texto plano
      isValidPassword = password === user.contrasena
      
      // Opcional: Actualizar la contraseña a hash si coincide
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10)
        await query(
          "UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?",
          [hashedPassword, user.id_usuario]
        )
      }
    }

    if (!isValidPassword) {
      return NextResponse.json({ message: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    // Crear sesión
    const sessionData = {
      id: user.id_usuario,
      username: user.nombre_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      id_rol: user.id_rol,
    }

    const cookieStore = await cookies()
    cookieStore.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 horas
    })

    return NextResponse.json({
      success: true,
      user: sessionData,
    })
  } catch (error) {
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 })
  }
}
