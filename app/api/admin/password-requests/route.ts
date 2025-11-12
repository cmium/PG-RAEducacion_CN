import { NextRequest, NextResponse } from "next/server"
import pool, { query, queryOne } from "@/lib/db"
import bcrypt from "bcryptjs"

// Estructura: id, email, new_password_hash, status (pending|approved|rejected), created_at
export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }
  // TODO: hash password antes de guardar
  await query(
    `INSERT INTO password_reset_requests (email, new_password_hash, status, created_at) VALUES (?, ?, 'pending', NOW())`,
    [email, password]
  )
  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (email) {
    // Consulta de estado por email (para el usuario)
    const rows = await query(
      `SELECT status FROM password_reset_requests WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
      [email]
    )
    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json(rows[0])
    } else {
      return NextResponse.json({ status: null })
    }
  }
  // Solo para admin: obtener todas las solicitudes pendientes
  const rows = await query(
    `SELECT id, email, status, created_at FROM password_reset_requests WHERE status = 'pending' ORDER BY created_at DESC`
  )
  return NextResponse.json(rows)
}

export async function PATCH(req: NextRequest) {
  // Admin aprueba o rechaza
  const { id, action } = await req.json()
  if (!id || !["approved", "rejected"].includes(action)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  await query(
    `UPDATE password_reset_requests SET status = ? WHERE id = ?`,
    [action, id]
  )
  if (action === "approved") {
    // Obtener email y nueva contraseña de la solicitud
    const reqRow: any = await queryOne(
      `SELECT email, new_password_hash FROM password_reset_requests WHERE id = ?`,
      [id]
    )
    if (reqRow && typeof reqRow === 'object' && 'email' in reqRow && 'new_password_hash' in reqRow) {
      // Buscar usuario por email
      const userRow: any = await queryOne(
        `SELECT id_usuario FROM usuarios WHERE correo = ?`,
        [reqRow.email]
      )
      if (userRow && typeof userRow === 'object' && 'id_usuario' in userRow) {
        // Hashear la nueva contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(reqRow.new_password_hash, 10)
        await query(
          `UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?`,
          [hashedPassword, userRow.id_usuario]
        )
      }
    }
  }
  return NextResponse.json({ ok: true })
}
